import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DateRangeQueryType,
  PaginationQueryType,
  PaginationResponseMeta,
  getStartAndEndOfDay,
} from '@halaqa/shared';
import { Prisma, PrismaClient } from 'generated/prisma/client';
import { createMariaDbAdapter } from './database.util';
import { EnvVariables } from 'src/types/declartion-merging';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor(configService: ConfigService<EnvVariables>) {
    console.log('Initializing DatabaseService with config:', {
      host: configService.get('DATABASE_HOST'),
      nodeEnv: configService.get('NODE_ENV'),
      DATABASE_NAME: configService.get('DATABASE_NAME'),
    });
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
      const { startAsJSDate } = getStartAndEndOfDay(timezone, query.fromDate);
      dateRangeFilter.gte = startAsJSDate;
    }

    if (query.toDate) {
      const { endAsJSDate } = getStartAndEndOfDay(timezone, query.toDate);
      dateRangeFilter.lte = endAsJSDate;
    }

    return dateRangeFilter;
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
