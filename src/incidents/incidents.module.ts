import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { CoreService } from 'src/core/core.service';
import { IncidentsQueryService } from './incidents-query/incidents-query.service';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
    ],
    providers: [IncidentsQueryService, IncidentsService, CoreService],
    controllers: [IncidentsController]
})
export class IncidentsModule {}
