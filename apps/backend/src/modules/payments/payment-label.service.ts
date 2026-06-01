import { Injectable } from '@nestjs/common';
import type {
  CreateTransactionLabelDto,
  QueryTransactionLabelsDto,
  QueryTransactionLabelsResponseDto,
  TransactionLabelDto,
} from '@halaqa/shared';
import { normalizeArabic } from '@halaqa/shared';
import { ISODateString } from '@halaqa/shared';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PaymentLabelService {
  constructor(private readonly prismaService: DatabaseService) {}

  async searchLabels(query: QueryTransactionLabelsDto): Promise<QueryTransactionLabelsResponseDto> {
    const { skip, take, page } = this.prismaService.handleQueryPagination(query);

    const where = query.search
      ? { nameNormalized: { contains: normalizeArabic(query.search) } }
      : {};

    const [rows, count] = await this.prismaService.$transaction([
      this.prismaService.transactionLabel.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
      }),
      this.prismaService.transactionLabel.count({ where }),
    ]);

    return {
      data: rows.map((row) => this.toDto(row)),
      ...this.prismaService.formatPaginationResponse({ page, count, limit: take }),
    };
  }

  async createLabel(dto: CreateTransactionLabelDto): Promise<TransactionLabelDto> {
    const row = await this.prismaService.transactionLabel.create({
      data: {
        name: dto.name,
        nameNormalized: normalizeArabic(dto.name),
      },
    });
    return this.toDto(row);
  }

  private toDto(row: { id: string; name: string; createdAt: Date }): TransactionLabelDto {
    return {
      id: row.id,
      name: row.name,
      createdAt: row.createdAt.toISOString() as ISODateString,
    };
  }
}
