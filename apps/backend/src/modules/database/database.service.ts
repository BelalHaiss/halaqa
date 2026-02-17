import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DateRangeQueryType,
  PaginationQueryType,
  PaginationResponseMeta,
} from '@halaqa/shared';
import { Prisma, PrismaClient, User } from 'generated/prisma/client';
import { createMariaDbAdapter } from './database.util';
import { EnvVariables } from 'src/types/declartion-merging';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(configService: ConfigService<EnvVariables>) {
    super({
      adapter: createMariaDbAdapter({
        DATABASE_HOST: configService.getOrThrow('DATABASE_HOST'),
        DATABASE_USER: configService.getOrThrow('DATABASE_USER'),
        DATABASE_PASSWORD: configService.getOrThrow('DATABASE_PASSWORD'),
        DATABASE_NAME: configService.getOrThrow('DATABASE_NAME'),
        DATABASE_PORT: configService.getOrThrow('DATABASE_PORT'),
      }),
    });
  }

  handleDateRangeFilter(
    query: DateRangeQueryType,
    timezone: string,
  ): Prisma.DateTimeFilter | undefined {
    if (!query.fromDate && !query.toDate) {
      return undefined;
    }

    const dateRangeFilter: Prisma.DateTimeFilter = {};

    if (query.fromDate) {
      const { startDate } = this.getStartAndEndOfDayForDate(
        query.fromDate,
        timezone,
      );
      dateRangeFilter.gte = startDate;
    }

    if (query.toDate) {
      const { endDate } = this.getStartAndEndOfDayForDate(
        query.toDate,
        timezone,
      );
      dateRangeFilter.lte = endDate;
    }

    return dateRangeFilter;
  }

  private getStartAndEndOfDayForDate(
    dateStr: string,
    timezone: string,
  ): { startDate: Date; endDate: Date } {
    // Import the shared date util function
    const { DateTime } = require('luxon');
    const dt = DateTime.fromISO(dateStr, { zone: timezone });
    return {
      startDate: dt.startOf('day').toJSDate(),
      endDate: dt.endOf('day').toJSDate(),
    };
  }

  handleQueryPagination(query: PaginationQueryType) {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    return { skip: (page - 1) * limit, take: limit, page };
  }

  formatPaginationResponse(args: {
    page: number;
    count: number;
    limit: number;
  }): PaginationResponseMeta {
    return {
      meta: {
        total: args.count,
        page: args.page,
        limit: args.limit,
        totalPages: Math.ceil(args.count / args.limit),
      },
    };
  }
}
