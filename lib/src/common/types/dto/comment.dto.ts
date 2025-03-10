import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { BaseDtoQuery } from "../../../common/base/query/base-query.model";

export class CommentDto {
  @IsString()
  @IsOptional()
  readonly incidentId: string;

  @Type(() => String)
  @IsString()
  readonly projectId: string;
}

export class PatchCommentDto extends CommentDto {
  @Type(() => String)
  @IsString()
  readonly message: string;
}

export class GetCommentsDto extends BaseDtoQuery {
  @IsString()
  @IsOptional()
  readonly incidentId: string;
}
