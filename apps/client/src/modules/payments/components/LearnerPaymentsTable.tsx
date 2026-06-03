import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, HandCoins, Trash2 } from 'lucide-react';
import {
  formatDate,
  getCurrencyLabel,
  LearnerPaymentsSortBy,
  LearnerPaymentSummaryDto,
  SortOrder,
} from '@halaqa/shared';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PaymentStatusBadge } from './PaymentStatusBadge';

type LearnerPaymentsTableProps = {
  rows: LearnerPaymentSummaryDto[];
  canDelete: boolean;
  canPay: boolean;
  isLoading?: boolean;
  sortBy?: LearnerPaymentsSortBy;
  sortOrder: SortOrder;
  onSort: (sortBy: LearnerPaymentsSortBy) => void;
  onView: (row: LearnerPaymentSummaryDto) => void;
  onPay: (row: LearnerPaymentSummaryDto) => void;
  onDelete: (row: LearnerPaymentSummaryDto) => void;
};

export function LearnerPaymentsTable({
  rows,
  canDelete,
  canPay,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onPay,
  onDelete,
}: LearnerPaymentsTableProps) {
  const sortableColumns: LearnerPaymentsSortBy[] = [
    'learnerName',
    'sessionsCount',
    'attendedCount',
    'totalAmount',
    'paidAmount',
    'currency',
    'status',
    'periodFrom',
    'periodTo',
  ];

  const columns = useMemo<ColumnDef<LearnerPaymentSummaryDto>[]>(
    () => [
      {
        accessorKey: 'learnerName',
        header: 'المتعلم',
        id: 'learnerName',
      },
      {
        accessorKey: 'sessionsCount',
        header: 'عدد الجلسات',
        id: 'sessionsCount',
      },
      {
        accessorKey: 'attendedCount',
        header: 'الجلسات المحضورة',
        id: 'attendedCount',
      },
      {
        accessorKey: 'totalAmount',
        header: 'الإجمالي',
        id: 'totalAmount',
      },
      {
        accessorKey: 'paidAmount',
        header: 'المدفوع',
        id: 'paidAmount',
      },
      {
        accessorKey: 'currency',
        id: 'currency',
        header: 'العملة',
        cell: ({ row }) => getCurrencyLabel(row.original.currency),
      },
      {
        accessorKey: 'status',
        header: 'الحالة',
        id: 'status',
        cell: ({ row }) => <PaymentStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'periodFrom',
        id: 'periodFrom',
        header: 'من',
        cell: ({ row }) =>
          formatDate({
            date: row.original.periodFrom,
            token: 'dd/MM/yyyy',
            locale: 'ar',
          }),
      },
      {
        accessorKey: 'periodTo',
        id: 'periodTo',
        header: 'إلى',
        cell: ({ row }) =>
          formatDate({
            date: row.original.periodTo,
            token: 'dd/MM/yyyy',
            locale: 'ar',
          }),
      },
      {
        id: 'actions',
        header: 'الإجراءات',
        cell: ({ row }) => (
          <div className='flex items-center gap-2'>
            <Button size='icon' variant='ghost' color='muted' onClick={() => onView(row.original)}>
              <Eye className='w-4 h-4' />
            </Button>
            {canPay ? (
              <Button
                size='icon'
                variant='ghost'
                color='success'
                onClick={() => onPay(row.original)}
                disabled={row.original.status === 'PAID'}
              >
                <HandCoins className='w-4 h-4' />
              </Button>
            ) : null}
            {canDelete ? (
              <Button
                size='icon'
                variant='ghost'
                color='danger'
                onClick={() => onDelete(row.original)}
              >
                <Trash2 className='w-4 h-4' />
              </Button>
            ) : null}
          </div>
        ),
      },
    ],
    [canDelete, canPay, onDelete, onPay, onView]
  );

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderSortIcon = (columnId: string) => {
    if (sortBy !== columnId) {
      return <ArrowUpDown className='h-3.5 w-3.5' />;
    }

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
              const isSortable = sortableColumns.includes(
                header.column.id as LearnerPaymentsSortBy
              );

              return (
                <TableHead key={header.id} className='text-center align-middle'>
                  {header.isPlaceholder ? null : isSortable ? (
                    <Button
                      variant='ghost'
                      color='muted'
                      size='sm'
                      onClick={() => onSort(header.column.id as LearnerPaymentsSortBy)}
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
            <TableCell colSpan={columns.length} className='text-center py-8 text-muted-foreground'>
              جاري التحميل...
            </TableCell>
          </TableRow>
        ) : table.getRowModel().rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={columns.length} className='text-center py-8 text-muted-foreground'>
              لا توجد بيانات
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => {
                return (
                  <TableCell key={cell.id} className='text-center align-middle'>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
