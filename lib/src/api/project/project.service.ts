import { Injectable, Logger } from "@nestjs/common";
import { MemberService } from "../member/member.service";
import { EntityManager } from "typeorm";
import * as crypto from "crypto";
import { ProjectQueryService } from "./project-query/project-query.service";
import { UserQueryService } from "../user/user-query/user-query.service";
import { ADMIN_NAME, ADMIN_EMAIL, INTERNAL_SERVER_ERROR } from "../../common/helpers/constants";
import dateUtils from "../../common/helpers/dateUtils";
import { gravatar } from "../../common/helpers/gravatar";
import { uuidService } from "../../common/helpers/uuid";
import { CreateProjectDto, ProjectDto } from "../../common/types/dto/project.dto";
import { Project } from "../../db/entities/project.entity";
import { ApiResponse } from "../../common/types/dto/response.dto";
import { BROWSER_SDK, MemberRole } from "@traceo/types";
import { MetricsService } from "../metrics/metrics.service";
import { RequestContext } from "../../common/middlewares/request-context/request-context.model";

@Injectable()
export class ProjectService {
  private readonly logger: Logger;

  constructor(
    private readonly entityManager: EntityManager,
    private readonly memberService: MemberService,
    private readonly projectQueryService: ProjectQueryService,
    private readonly userQueryService: UserQueryService,
    private readonly metricsService: MetricsService
  ) {
    this.logger = new Logger(ProjectService.name);
  }

  public async create(data: CreateProjectDto): Promise<ApiResponse<Project>> {
    const { id, username } = RequestContext.user;

    return this.entityManager
      .transaction(async (manager) => {
        const isExists = await this.projectQueryService.getDtoBy({ name: data.name });
        if (isExists) {
          return new ApiResponse("error", undefined, {
            error: "Project with this name already exists"
          });
        }

        const user = await this.userQueryService.getDtoBy({ id });
        if (!user) {
          throw new Error(INTERNAL_SERVER_ERROR);
        }

        const url = gravatar.url(data.name, "identicon");
        const payload: Partial<Project> = {
          ...data,
          id: uuidService.generate(),
          createdAt: dateUtils.toUnix(),
          updatedAt: dateUtils.toUnix(),
          owner: user,
          gravatar: url
        };

        const project = await manager.getRepository(Project).save(payload);
        if (!BROWSER_SDK.includes(data.sdk)) {
          // In server-project we have to create default metrics configurations
          await this.metricsService.addDefaultMetrics(project, manager);
        }

        if (username !== ADMIN_NAME) {
          const admin = await this.userQueryService.getDtoBy({ email: ADMIN_EMAIL });
          await this.memberService.createMember(
            admin,
            project,
            MemberRole.ADMINISTRATOR,
            manager
          );
        }

        await this.memberService.createMember(user, project, MemberRole.ADMINISTRATOR, manager);

        return new ApiResponse("success", "Project successfully created", {
          redirectUrl: `/project/${project.id}/overview`,
          id: project.id
        });
      })
      .catch((err: Error) => {
        this.logger.error(`[${this.create.name}] Caused by: ${err}`);
        return new ApiResponse("error", INTERNAL_SERVER_ERROR, err);
      });
  }

  public async generateApiKey(id: string): Promise<ApiResponse<string>> {
    const apiKey = `tr_${crypto.randomUUID()}`;
    try {
      await this.update(id, { apiKey });
      return new ApiResponse("success", "API Key Generated.", apiKey);
    } catch (err) {
      this.logger.error(`[${this.generateApiKey.name}] Caused by: ${err}`);
      return new ApiResponse("error", INTERNAL_SERVER_ERROR, err);
    }
  }

  public async removeApiKey(id: string): Promise<ApiResponse<unknown>> {
    try {
      await this.update(id, { apiKey: null });
      return new ApiResponse("success", "API Key Removed.");
    } catch (err) {
      this.logger.error(`[${this.removeApiKey.name}] Caused by: ${err}`);
      return new ApiResponse("error", INTERNAL_SERVER_ERROR, err);
    }
  }

  public async update(
    id: string,
    update: Partial<Project>,
    manager: EntityManager = this.entityManager
  ): Promise<void> {
    await manager.getRepository(Project).update(
      { id },
      {
        updatedAt: dateUtils.toUnix(),
        ...update
      }
    );
  }

  public async updateProject(projectBody: ProjectDto | Partial<Project>) {
    const { id, ...rest } = projectBody;

    try {
      await this.update(id, rest);
      return new ApiResponse("success", "Project updated");
    } catch (err) {
      this.logger.error(`[${this.update.name}] Caused by: ${err}`);
      return new ApiResponse("error", INTERNAL_SERVER_ERROR, err);
    }
  }

  public async delete(projectId: string): Promise<ApiResponse<unknown>> {
    try {
      await this.entityManager
        .getRepository(Project)
        .createQueryBuilder("project")
        .where("project.id = :projectId", { projectId })
        .delete()
        .execute();

      return new ApiResponse("success", "Project removed");
    } catch (err) {
      this.logger.error(`[${this.delete.name}] Caused by: ${err}`);
      return new ApiResponse("error", INTERNAL_SERVER_ERROR, err);
    }
  }
}
