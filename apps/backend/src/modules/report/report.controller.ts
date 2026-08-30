import { Controller, Get, Query } from '@nestjs/common';
import type { GroupReportDTO, ReportQueryDTO } from '@halaqa/shared';
import { reportQuerySchema } from '@halaqa/shared';
import { UserRole } from 'generated/prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { ReportService } from './report.service';

@Controller('reports')
@Roles([UserRole.ADMIN, UserRole.MODERATOR])
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Get('group')
  getGroupReport(
    @Query(new ZodValidationPipe(reportQuerySchema('en'))) query: ReportQueryDTO
  ): Promise<GroupReportDTO> {
    return this.reportService.getGroupReport(query);
  }
}
