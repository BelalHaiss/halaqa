import { Module } from '@nestjs/common';
import { GroupController } from './group.controller';
import { GroupService } from './group.service';
import { OrchestratorModule } from '../orchestrator/orchestrator.module';

@Module({
  imports: [OrchestratorModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
