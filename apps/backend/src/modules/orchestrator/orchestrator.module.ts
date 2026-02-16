import { Module } from '@nestjs/common';
import { GroupLearnerOrchestrator } from './group-learner.orchestrator';

@Module({
  providers: [GroupLearnerOrchestrator],
  exports: [GroupLearnerOrchestrator],
})
export class OrchestratorModule {}
