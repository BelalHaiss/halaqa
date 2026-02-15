import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type {
  CreateLearnerDto,
  LearnerDto,
  QueryLearnersDto,
  QueryLearnersResponseDto,
  UpdateLearnerDto,
} from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import {
  createLearnerSchema,
  queryLearnersSchema,
  updateLearnerSchema,
} from './validation/learner.validation';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('learner')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  createLearner(
    @Body(new ZodValidationPipe(createLearnerSchema))
    dto: CreateLearnerDto,
  ): Promise<LearnerDto> {
    return this.userService.createLearner(dto);
  }

  @Get('learner')
  queryLearners(
    @Query(new ZodValidationPipe(queryLearnersSchema))
    query: QueryLearnersDto,
  ): Promise<QueryLearnersResponseDto> {
    return this.userService.queryLearners(query);
  }

  @Patch('learner/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  updateLearner(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateLearnerSchema))
    dto: UpdateLearnerDto,
  ): Promise<LearnerDto> {
    return this.userService.updateLearner(id, dto);
  }

  @Delete('learner/:id')
  @Roles([UserRole.ADMIN, UserRole.MODERATOR])
  async deleteLearner(@Param('id') id: string): Promise<void> {
    await this.userService.deleteLearner(id);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.userService.delete(id);
    return { success: true };
  }
}
