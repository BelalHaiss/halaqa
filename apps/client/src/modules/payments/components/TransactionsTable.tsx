import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from 'lucide-react';
import {
  FinancialTransactionSummaryDto,
  formatDate,
  getCurrencyLabel,
  getTransactionEntityTypeLabel,
  SortOrder,
  TransactionsSortBy,
} from '@halaqa/shared';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TransactionTypeBadge } from './TransactionTypeBadge';

type TransactionsTableProps = {
  rows: FinancialTransactionSummaryDto[];
  canDelete: boolean;
  isLoading?: boolean;
  sortBy?: TransactionsSortBy;
  sortOrder: SortOrder;
  onSort: (sortBy: TransactionsSortBy) => void;
  onDelete: (row: FinancialTransactionSummaryDto) => void;
};

export function TransactionsTable({
  rows,
  canDelete,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onDelete,
}: TransactionsTableProps) {
  const sortableColumns: TransactionsSortBy[] = ['createdAt', 'amount', 'currency'];

  const columns = useMemo<ColumnDef<FinancialTransactionSummaryDto>[]>(
    () => [
      {
        id: 'type',
        header: 'النوع',
        cell: ({ row }) => <TransactionTypeBadge type={row.original.type} />,
      },
      {
        id: 'amount',
        header: 'المبلغ',
        cell: ({ row }) => (
          <span className='font-mono font-medium tabular-nums'>
            {row.original.amount.toLocaleString('ar-EG', { minimumFractionDigits: 2 })}
          </span>
        ),
      },
      {
        id: 'currency',
        header: 'العملة',
        cell: ({ row }) => getCurrencyLabel(row.original.currency),
      },
      {
        id: 'label',
        header: 'التصنيف',
        cell: ({ row }) =>
          row.original.label ? (
            <Badge color='muted'>{row.original.label.name}</Badge>
          ) : (
            <span className='text-muted-foreground'>—</span>
          ),
      },
      {
        id: 'entityType',
        header: 'المصدر',
        cell: ({ row }) => (
          <span className='text-sm text-muted-foreground'>
            {getTransactionEntityTypeLabel(row.original.entityType)}
          </span>
        ),
      },
      {
        id: 'notes',
        header: 'ملاحظات',
        cell: ({ row }) =>
          row.original.notes ? (
            <span className='max-w-40 truncate text-sm' title={row.original.notes}>
              {row.original.notes}
            </span>
          ) : (
            <span className='text-muted-foreground'>—</span>
          ),
      },
      {
        id: 'createdByName',
        header: 'بواسطة',
        cell: ({ row }) => <span className='text-sm'>{row.original.createdByName}</span>,
      },
      {
        id: 'createdAt',
        header: 'التاريخ',
        cell: ({ row }) =>
          formatDate({
            date: row.original.createdAt,
            token: 'dd/MM/yyyy',
            locale: 'ar',
          }),
      },
      ...(canDelete
        ? ([
            {
              id: 'actions',
              header: '',
              cell: ({ row }) =>
                row.original.entityType === 'MANUAL' ? (
                  <Button
                    size='icon'
                    variant='ghost'
                    color='danger'
                    onClick={() => onDelete(row.original)}
                  >
                    <Trash2 className='h-4 w-4' />
                  </Button>
                ) : null,
            },
          ] as ColumnDef<FinancialTransactionSummaryDto>[])
        : []),
    ],
    [canDelete, onDelete]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderSortIcon = (columnId: string) => {
    if (sortBy !== columnId) return <ArrowUpDown className='h-3.5 w-3.5' />;
    return sortOrder === 'asc' ? (
      <ArrowUp className='h-3.5 w-3.5' />
    ) : (
      <ArrowDown className='h-3.5 w-3.5' />
    );
  };

  return (
    <Table className='rounded-lg border bg-card shadow-sm'>
      <TableHeader className='bg-muted/40'>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const isSortable = sortableColumns.includes(header.column.id as TransactionsSortBy);
              return (
                <TableHead key={header.id} className='text-center align-middle'>
                  {header.isPlaceholder ? null : isSortable ? (
                    <Button
                      variant='ghost'
                      color='muted'
                      size='sm'
                      onClick={() => onSort(header.column.id as TransactionsSortBy)}
                      className='w-full justify-center gap-1.5 px-0'
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {renderSortIcon(header.column.id)}
                    </Button>
                  ) : (
                    <span className='inline-flex w-full justify-center'>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </span>
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={columns.length} className='py-10 text-center text-muted-foreground'>
              جاري التحميل...
            </TableCell>
          </TableRow>
        ) : table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className='py-10 text-center text-muted-foreground'>
              لا توجد معاملات
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} className='select-none'>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className='text-center align-middle'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
