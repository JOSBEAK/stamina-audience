import React from 'react';
import { AudienceList } from '@stamina-project/types';
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

interface DeletedAudienceListsTableProps {
  deletedAudienceLists: AudienceList[] | undefined;
  onRestore: (id: string) => void;
}

export const DeletedAudienceListsTable: React.FC<DeletedAudienceListsTableProps> = ({
  deletedAudienceLists,
  onRestore,
}) => {
  return (
    <div className="overflow-hidden mt-4 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Deleted</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deletedAudienceLists?.map((audienceList) => (
            <TableRow key={audienceList.id}>
              <TableCell>{audienceList.name}</TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(audienceList.deletedAt ?? ''), {
                  addSuffix: true,
                })}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRestore(audienceList.id)}
                >
                  <Undo className="mr-2 w-4 h-4" />
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