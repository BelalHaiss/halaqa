import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import type {
  ChangeOwnPasswordDto,
  CountDto,
  CreateStaffUserDto,
  CreateLearnerDto,
  LearnerDto,
  StaffUserDto,
  StaffUsersResponseDto,
  QueryLearnersDto,
  QueryLearnersResponseDto,
  UpdateOwnProfileDto,
  UpdateStaffUserDto,
  UpdateLearnerDto,
  UserAuthType,
} from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import type { User as UserEntity } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  createLearnerSchema,
  queryLearnersSchema,
  updateLearnerSchema,
} from './validation/learner.validation';
import { createStaffSchema, updateStaffSchema } from './validation/staff.validation';
import { changeOwnPasswordSchema, updateOwnProfileSchema } from './validation/profile.validation';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('learner')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  createLearner(
    @Body(new ZodValidationPipe(createLearnerSchema))
    dto: CreateLearnerDto
  ): Promise<LearnerDto> {
    return this.userService.createLearner(dto);
  }

  @Get('learner')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
  queryLearners(
    @User() actor: UserEntity,
    @Query(new ZodValidationPipe(queryLearnersSchema))
    query: QueryLearnersDto
  ): Promise<QueryLearnersResponseDto> {
    return this.userService.queryLearners(actor, query);
  }

  @Patch('learner/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
  updateLearner(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLearnerSchema))
    dto: UpdateLearnerDto
  ): Promise<LearnerDto> {
    return this.userService.updateLearner(id, dto);
  }

  @Delete('learner/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async deleteLearner(@Param('id') id: string): Promise<void> {
    await this.userService.deleteLearner(id);
  }

  @Get('staff')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  getStaffUsers(@User() actor: UserEntity): Promise<StaffUsersResponseDto> {
    return this.userService.getStaffUsers(actor);
  }

  @Post('staff')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  createStaffUser(
    @User() actor: UserEntity,
    @Body(new ZodValidationPipe(createStaffSchema))
    dto: CreateStaffUserDto
  ): Promise<StaffUserDto> {
    return this.userService.createStaffUser(actor, dto);
  }

  @Patch('staff/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  updateStaffUser(
    @Param('id') id: string,
    @User() actor: UserEntity,
    @Body(new ZodValidationPipe(updateStaffSchema))
    dto: UpdateStaffUserDto
  ): Promise<StaffUserDto> {
    return this.userService.updateStaffUser(id, actor, dto);
  }

  @Delete('staff/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async deleteStaffUser(@Param('id') id: string, @User() actor: UserEntity): Promise<void> {
    await this.userService.deleteStaffUser(id, actor);
  }

  @Get('me')
  getMe(@User() user: UserEntity): Promise<UserAuthType> {
    return this.userService.getMe(user.id);
  }

  @Patch('me/profile')
  updateOwnProfile(
    @User() user: UserEntity,
    @Body(new ZodValidationPipe(updateOwnProfileSchema))
    dto: UpdateOwnProfileDto
  ): Promise<UserAuthType> {
    return this.userService.updateOwnProfile(user.id, dto);
  }

  @Post('me/change-password')
  async changeOwnPassword(
    @User() user: UserEntity,
    @Body(new ZodValidationPipe(changeOwnPasswordSchema))
    dto: ChangeOwnPasswordDto
  ): Promise<void> {
    await this.userService.changeOwnPassword(user.id, dto);
  }

  @Get('stats/learners-count')
  getLearnersCount(@User() user: UserEntity): Promise<CountDto> {
    return this.userService.getLearnersCountDto(user);
  }

  @Get('stats/tutors-count')
  getTutorsCount(@User() user: UserEntity): Promise<CountDto> {
    return this.userService.getTutorsCountDto(user);
  }
}
