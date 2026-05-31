import { useMemo } from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Trash2 } from 'lucide-react';
import {
  formatDate,
  getCurrencyLabel,
  SortOrder,
  TutorPaymentsSortBy,
  TutorPaymentSummaryDto,
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

type TutorPaymentsTableProps = {
  rows: TutorPaymentSummaryDto[];
  canDelete: boolean;
  isLoading?: boolean;
  sortBy?: TutorPaymentsSortBy;
  sortOrder: SortOrder;
  onSort: (sortBy: TutorPaymentsSortBy) => void;
  onView: (row: TutorPaymentSummaryDto) => void;
  onDelete: (row: TutorPaymentSummaryDto) => void;
};

export function TutorPaymentsTable({
  rows,
  canDelete,
  isLoading,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onDelete,
}: TutorPaymentsTableProps) {
  const sortableColumns: TutorPaymentsSortBy[] = [
    'tutorName',
    'sessionsCount',
    'totalAmount',
    'currency',
    'periodFrom',
    'periodTo',
  ];

  const columns = useMemo<ColumnDef<TutorPaymentSummaryDto>[]>(
    () => [
      {
        accessorKey: 'tutorName',
        header: 'المعلم',
        id: 'tutorName',
      },
      {
        accessorKey: 'sessionsCount',
        header: 'عدد الجلسات',
        id: 'sessionsCount',
      },
      {
        accessorKey: 'totalAmount',
        header: 'الإجمالي',
        id: 'totalAmount',
      },
      {
        accessorKey: 'currency',
        id: 'currency',
        header: 'العملة',
        cell: ({ row }) => getCurrencyLabel(row.original.currency),
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
    [canDelete, onDelete, onView]
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
              const isSortable = sortableColumns.includes(header.column.id as TutorPaymentsSortBy);

              return (
                <TableHead key={header.id} className='text-center align-middle'>
                  {header.isPlaceholder ? null : isSortable ? (
                    <Button
                      variant='ghost'
                      color='muted'
                      size='sm'
                      onClick={() => onSort(header.column.id as TutorPaymentsSortBy)}
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
