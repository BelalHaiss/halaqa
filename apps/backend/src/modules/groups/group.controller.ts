import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import type {
  CountDto,
  CreateLearnerDto,
  CreateGroupDto,
  GroupDetailsDto,
  GroupSelectOptionDto,
  GroupSummaryDto,
  GroupTutorSummaryDto,
  UpdateGroupDto,
} from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import type { User as UserEntity } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  createGroupSchema,
  createLearnerForGroupSchema,
  updateGroupSchema,
} from './validation/group.validation';
import { GroupService } from './group.service';
import { GroupLearnerOrchestrator } from '../orchestrator/group-learner.orchestrator';

@Controller('groups')
export class GroupController {
  constructor(
    private readonly groupService: GroupService,
    private readonly groupLearnerOrchestrator: GroupLearnerOrchestrator,
  ) {}

  @Get()
  getGroups(@User() user: UserEntity): Promise<GroupSummaryDto[]> {
    return this.groupService.getGroups(user);
  }

  @Get('tutors')
  getTutors(): Promise<GroupTutorSummaryDto[]> {
    return this.groupService.getTutors();
  }

  @Get('options')
  getGroupOptions(@User() user: UserEntity): Promise<GroupSelectOptionDto[]> {
    return this.groupService.getGroupOptions(user);
  }

  @Get(':id')
  getGroupById(
    @Param('id') id: string,
    @User() user: UserEntity,
  ): Promise<GroupDetailsDto> {
    return this.groupService.getGroupById(id, user);
  }

  @Post()
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  createGroup(
    @Body(new ZodValidationPipe(createGroupSchema))
    dto: CreateGroupDto,
  ): Promise<GroupDetailsDto> {
    return this.groupService.createGroup(dto);
  }

  @Patch(':id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  updateGroup(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateGroupSchema))
    dto: UpdateGroupDto,
  ): Promise<GroupDetailsDto> {
    return this.groupService.updateGroup(id, dto);
  }

  @Post(':id/students/create')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async createLearnerAndAddToGroup(
    @Param('id') groupId: string,
    @Body(new ZodValidationPipe(createLearnerForGroupSchema))
    dto: CreateLearnerDto,
    @User() user: UserEntity,
  ): Promise<GroupDetailsDto> {
    await this.groupLearnerOrchestrator.createLearnerAndAttachToGroup(
      groupId,
      dto,
    );
    return this.groupService.getGroupById(groupId, user);
  }

  @Delete(':id/students/:userId')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  removeStudentFromGroup(
    @Param('id') groupId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.groupService.removeStudentFromGroup(groupId, userId);
  }

  @Get('stats/groups-count')
  getGroupsCount(@User() user: UserEntity): Promise<CountDto> {
    return this.groupService.getGroupsCount(user);
  }
}
