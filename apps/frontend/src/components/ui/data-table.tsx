import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from './skeleton';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';

export interface ColumnDef<TData> {
  id: string;
  header: () => React.ReactNode;
  cell: (data: TData) => React.ReactNode;
  enableSorting?: boolean;
  headerClassName?: string;
  cellClassName?: string;
}

interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  isLoading: boolean;
  onSort?: (field: string) => void;
  sortField?: string;
  sortDirection?: 'asc' | 'desc' | null;
  selectedIds?: string[];
  onSelectionChange?: (id: string) => void;
  onSelectAll?: () => void;
  isAllSelected?: boolean;
  onRowClick?: (data: TData) => void;
  renderSubComponent?: (data: TData) => React.ReactNode;
  getRowId: (data: TData) => string;
}

export function DataTable<TData>({
  columns,
  data,
  isLoading,
  onSort,
  sortField,
  sortDirection,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  isAllSelected,
  onRowClick,
  getRowId,
}: DataTableProps<TData>) {
  const renderSortArrow = (field: string) => {
    if (sortField !== field || !sortDirection) {
      return <ChevronsUpDown className="ml-2 h-4 w-4" />;
    }
    if (sortDirection === 'asc') {
      return <ArrowUp className="ml-2 h-4 w-4" />;
    }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="border-b bg-gray-50/50">
            {onSelectionChange && (
              <TableHead className="w-12 pl-4">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={onSelectAll}
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead key={column.id} className={column.headerClassName}>
                {column.enableSorting && onSort ? (
                  <Button
                    variant="ghost"
                    onClick={() => onSort(column.id)}
                    className="h-auto p-0 font-medium text-gray-700 hover:text-gray-900 hover:bg-transparent"
                  >
                    {column.header()}
                    {renderSortArrow(column.id)}
                  </Button>
                ) : (
                  column.header()
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  {onSelectionChange && (
                    <TableCell className="pl-4">
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.cellClassName}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  onClick={() => onRowClick?.(row)}
                  className="cursor-pointer"
                >
                  {onSelectionChange && (
                    <TableCell
                      className="pl-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds?.includes(getRowId(row))}
                        onCheckedChange={() => onSelectionChange(getRowId(row))}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.cellClassName}>
                      {column.cell(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
    </div>
  );
} 