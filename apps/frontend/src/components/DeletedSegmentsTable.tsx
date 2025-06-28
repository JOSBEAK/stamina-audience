import React from 'react';
import { Segment } from '@stamina-project/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Undo } from 'lucide-react';

interface DeletedSegmentsTableProps {
  deletedSegments: Segment[] | undefined;
  onRestore: (id: string) => void;
}

export const DeletedSegmentsTable: React.FC<DeletedSegmentsTableProps> = ({
  deletedSegments,
  onRestore,
}) => {
  return (
    <div className="border rounded-lg overflow-hidden mt-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletedSegments?.map((segment) => (
            <TableRow key={segment.id}>
              <TableCell>{segment.name}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(segment.deletedAt!), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(segment.id)}
                >
                  <Undo className="mr-2 h-4 w-4" />
                  Restore
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}; 