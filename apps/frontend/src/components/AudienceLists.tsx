import React, { useState } from 'react';
import {
  useAudienceLists,
  useCreateAudienceList,
  useSoftDeleteAudienceList,
  useDeletedAudienceLists,
  useRestoreAudienceList,
} from '@stamina-project/frontend-hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AudienceList } from '@stamina-project/types';
import {
  useDebounce } from '@stamina-project/frontend-utils';
import { useContacts } from '@stamina-project/frontend-hooks';
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
import { AudienceListsTable } from './AudienceListsTable';
import { DeletedAudienceListsTable } from './DeletedAudienceListsTable';

interface AudienceListsProps {
  onSelectAudienceList: (audienceListId: string | null) => void;
  onAudienceListCreated: (audienceList: AudienceList) => void;
}

export function AudienceLists({
  onSelectAudienceList,
  onAudienceListCreated,
}: AudienceListsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newAudienceListName, setNewAudienceListName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('updatedAt:desc');
  const [sortField, setSortField] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    'desc'
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAudienceLists, setSelectedAudienceLists] = useState<string[]>([]);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data: audienceLists, isLoading, refetch: refetchAudienceLists } = useAudienceLists({
    search: debouncedSearch,
    sort,
  });

  const { data: deletedAudienceLists, refetch: refetchDeleted } =
    useDeletedAudienceLists();
  const softDeleteMutation = useSoftDeleteAudienceList();
  const restoreMutation = useRestoreAudienceList();

  const { data: allContactsData } = useContacts(
    { limit: 1 },
    { enabled: true }
  );
  const allContactsCount = allContactsData?.total ?? 0;

  const createAudienceListMutation = useCreateAudienceList();

  const handleCreateAudienceList = () => {
    if (!newAudienceListName.trim()) {
      toast.error('List name cannot be empty.');
      return;
    }

    toast.promise(createAudienceListMutation.mutateAsync({ name: newAudienceListName }), {
      loading: 'Creating list...',
      success: (newAudienceList) => {
        setNewAudienceListName('');
        setIsCreating(false);
        onAudienceListCreated(newAudienceList);
        refetchAudienceLists();
        return 'List created successfully! Now add some participants.';
      },
      error: 'Failed to create list.',
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedAudienceLists.length === 0) return;

    const promise = Promise.all(
      selectedAudienceLists.map((id) => softDeleteMutation.mutateAsync(id))
    );

    toast.promise(promise, {
      loading: `Deleting ${selectedAudienceLists.length} list(s)...`,
      success: () => {
        setSelectedAudienceLists([]);
        refetchAudienceLists();
        refetchDeleted();
        setIsDeleteDialogOpen(false);
        return 'List(s) moved to recently deleted.';
      },
      error: 'Failed to delete list(s).',
    });
  };

  const handleRestore = (id: string) => {
    toast.promise(restoreMutation.mutateAsync(id), {
      loading: 'Restoring list...',
      success: () => {
        refetchAudienceLists();
        refetchDeleted();
        return 'List restored successfully!';
      },
      error: 'Failed to restore list.',
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

  const handleSelectionChange = (audienceListId: string) => {
    setSelectedAudienceLists((prev) =>
      prev.includes(audienceListId)
        ? prev.filter((id) => id !== audienceListId)
        : [...prev, audienceListId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAudienceLists.length === audienceLists?.length) {
      setSelectedAudienceLists([]);
    } else {
      setSelectedAudienceLists(audienceLists?.map((s) => s.id) || []);
    }
  };

  const isAllSelected =
    audienceLists &&
    selectedAudienceLists.length === audienceLists.length &&
    audienceLists.length > 0
      ? true
      : false;

  return (
    <div className="mt-6">
      <Tabs defaultValue="all">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all">Lists</TabsTrigger>
            <TabsTrigger value="deleted">
              Recently Deleted ({deletedAudienceLists?.length || 0})
            </TabsTrigger>
          </TabsList>
          {isCreating ? (
            <div className="flex gap-2 items-center">
              <Input
                placeholder="New list name"
                value={newAudienceListName}
                onChange={(e) => setNewAudienceListName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateAudienceList()}
                autoFocus
                className="w-auto"
              />
              <Button size="sm" onClick={handleCreateAudienceList}>
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
              Create List
            </Button>
          )}
        </div>
        <TabsContent value="all">
          <div className="flex justify-between items-center my-4">
            {selectedAudienceLists.length > 0 ? (
              <div className="flex gap-4 items-center">
                <span className="text-sm font-medium">
                  {selectedAudienceLists.length} selected
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
          <AudienceListsTable
            isLoading={isLoading}
            audienceLists={audienceLists}
            selectedAudienceLists={selectedAudienceLists}
            isAllSelected={isAllSelected}
            allContactsCount={allContactsCount}
            onSelectAll={handleSelectAll}
            onSelectionChange={handleSelectionChange}
            onSelectAudienceList={onSelectAudienceList}
            onSort={handleSort}
            sortField={sortField}
            sortDirection={sortDirection}
          />
        </TabsContent>
        <TabsContent value="deleted">
          <DeletedAudienceListsTable
            deletedAudienceLists={deletedAudienceLists}
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
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move the selected list(s) to the recently deleted folder.
              You can restore them later.
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