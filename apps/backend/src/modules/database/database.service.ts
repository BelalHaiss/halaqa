import { Injectable } from '@nestjs/common';
import { PaginationQueryType, PaginationResponseMeta } from '@halaqa/shared';
import { PrismaClient } from 'generated/prisma';
import { mariaDbAdapter } from './database.util';

@Injectable()
export class DatabaseService extends PrismaClient {
  constructor() {
    super({ adapter: mariaDbAdapter });
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
