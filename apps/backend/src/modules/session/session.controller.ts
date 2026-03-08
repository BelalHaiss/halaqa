import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserRole } from 'generated/prisma/client';
import type {
  SessionDetailsDTO,
  SessionSummaryDTO,
  UpdateSessionActionDTO,
  SessionQueryDTO,
  PaginatedResult,
} from '@halaqa/shared';
import type { User as AuthenticatedUser } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { User } from 'src/decorators/user.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { SessionService } from './session.service';
import { updateSessionActionSchema, sessionQuerySchema } from '@halaqa/shared';

@Controller('sessions')
@Roles([UserRole.ADMIN, UserRole.MODERATOR, UserRole.TUTOR])
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('today')
  async getCurrentDaySessions(@User() user: AuthenticatedUser): Promise<SessionSummaryDTO[]> {
    return this.sessionService.getTodaySessions(user);
  }

  @Get('history')
  async querySessions(
    @Query(new ZodValidationPipe(sessionQuerySchema('en'))) query: SessionQueryDTO,
    @User() user: AuthenticatedUser
  ): Promise<PaginatedResult<SessionSummaryDTO[]>> {
    return this.sessionService.querySessions(query, user);
  }

  @Get(':id')
  async getSessionDetails(
    @Param('id') id: string,
    @User() user: AuthenticatedUser
  ): Promise<SessionDetailsDTO> {
    return this.sessionService.getSessionDetails(id, user);
  }

  @Patch(':id')
  async updateSession(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateSessionActionSchema('en')))
    payload: UpdateSessionActionDTO,
    @User() user: AuthenticatedUser
  ): Promise<SessionDetailsDTO> {
    return this.sessionService.updateSession(id, payload, user);
  }
}
