import React, { useState } from 'react';
import {
  useSegments,
  useCreateSegment,
  useSoftDeleteSegment,
  useDeletedSegments,
  useRestoreSegment,
} from '@/hooks/useSegments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUpDown, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Segment } from '@stamina-project/types';
import {
  useDebounce } from '@/hooks/useDebounce';
import { useContacts } from '@/hooks/useContacts';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { SegmentsTable } from './SegmentsTable';
import { DeletedSegmentsTable } from './DeletedSegmentsTable';

interface SegmentListProps {
  onSelectSegment: (segmentId: string | null) => void;
  onSegmentCreated: (segment: Segment) => void;
}

export function SegmentList({
  onSelectSegment,
  onSegmentCreated,
}: SegmentListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('updatedAt:desc');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    'desc'
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSegments, setSelectedSegments] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: segments, isLoading, refetch: refetchSegments } = useSegments({
    search: debouncedSearch,
    sort,
  });

  const { data: deletedSegments, refetch: refetchDeleted } =
    useDeletedSegments();
  const softDeleteMutation = useSoftDeleteSegment();
  const restoreMutation = useRestoreSegment();

  const { data: allContactsData } = useContacts(
    { limit: 1 },
    { enabled: true }
  );
  const allContactsCount = allContactsData?.total ?? 0;

  const createSegmentMutation = useCreateSegment();

  const handleCreateSegment = () => {
    if (!newSegmentName.trim()) {
      toast.error('Segment name cannot be empty.');
      return;
    }

    toast.promise(createSegmentMutation.mutateAsync({ name: newSegmentName }), {
      loading: 'Creating segment...',
      success: (newSegment) => {
        setNewSegmentName('');
        setIsCreating(false);
        onSegmentCreated(newSegment);
        refetchSegments();
        return 'Segment created successfully! Now add some participants.';
      },
      error: 'Failed to create segment.',
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedSegments.length === 0) return;

    const promise = Promise.all(
      selectedSegments.map((id) => softDeleteMutation.mutateAsync(id))
    );

    toast.promise(promise, {
      loading: `Deleting ${selectedSegments.length} segment(s)...`,
      success: () => {
        setSelectedSegments([]);
        refetchSegments();
        refetchDeleted();
        setIsDeleteDialogOpen(false);
        return 'Segment(s) moved to recently deleted.';
      },
      error: 'Failed to delete segment(s).',
    });
  };

  const handleRestore = (id: string) => {
    toast.promise(restoreMutation.mutateAsync(id), {
      loading: 'Restoring segment...',
      success: () => {
        refetchSegments();
        refetchDeleted();
        return 'Segment restored successfully!';
      },
      error: 'Failed to restore segment.',
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'desc' ? 'asc' : sortDirection === 'asc' ? null : 'desc'
      );
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  React.useEffect(() => {
    if (sortField && sortDirection) {
      setSort(`${sortField}:${sortDirection}`);
    } else {
      setSort('updatedAt:desc');
    }
  }, [sortField, sortDirection]);

  const handleSelectionChange = (segmentId: string) => {
    setSelectedSegments((prev) =>
      prev.includes(segmentId)
        ? prev.filter((id) => id !== segmentId)
        : [...prev, segmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedSegments.length === segments?.length) {
      setSelectedSegments([]);
    } else {
      setSelectedSegments(segments?.map((s) => s.id) || []);
    }
  };

  const isAllSelected =
    segments &&
    selectedSegments.length === segments.length &&
    segments.length > 0
      ? true
      : false;

  return (
    <div className="mt-6">
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Segments</TabsTrigger>
            <TabsTrigger value="deleted">
              Recently Deleted ({deletedSegments?.length || 0})
            </TabsTrigger>
          </TabsList>
          {isCreating ? (
            <div className="flex gap-2 items-center">
              <Input
                placeholder="New segment name"
                value={newSegmentName}
                onChange={(e) => setNewSegmentName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateSegment()}
                autoFocus
                className="w-auto"
              />
              <Button size="sm" onClick={handleCreateSegment}>
                Create
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(false)}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 w-4 h-4" />
              Create Segment
            </Button>
          )}
        </div>
        <TabsContent value="all">
          <div className="flex justify-between items-center my-4">
            {selectedSegments.length > 0 ? (
              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium">
                  {selectedSegments.length} selected
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="mr-2 w-4 h-4" />
                  Delete
                </Button>
              </div>
            ) : (
              <div className="w-1/3">
                <Input
                  placeholder="Search lists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </div>
          <SegmentsTable
            isLoading={isLoading}
            segments={segments}
            selectedSegments={selectedSegments}
            isAllSelected={isAllSelected}
            allContactsCount={allContactsCount}
            onSelectAll={handleSelectAll}
            onSelectionChange={handleSelectionChange}
            onSelectSegment={onSelectSegment}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DeletedSegmentsTable
            deletedSegments={deletedSegments}
            onRestore={handleRestore}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the{' '}
              <span className="font-semibold">
                {selectedSegments.length} segment(s)
              </span>
              . They will be moved to recently deleted and will be permanently
              removed after 90 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 