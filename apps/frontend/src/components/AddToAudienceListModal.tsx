import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useAudienceLists } from '@/hooks/useAudienceLists';
import { AudienceList } from '@stamina-project/types';

interface AddToAudienceListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (audienceListId: string) => void;
  contactCount: number;
  currentAudienceListId?: string | null;
}

export function AddToAudienceListModal({
  isOpen,
  onClose,
  onConfirm,
  contactCount,
  currentAudienceListId,
}: AddToAudienceListModalProps) {
  const [selectedAudienceList, setSelectedAudienceList] = useState<string>('');
  const { data: audienceLists, isLoading } = useAudienceLists();

  const availableAudienceLists = React.useMemo(() => {
    if (!audienceLists) return [];
    return audienceLists.filter((list) => list.id !== currentAudienceListId);
  }, [audienceLists, currentAudienceListId]);

  const handleConfirm = () => {
    if (selectedAudienceList) {
      onConfirm(selectedAudienceList);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
          <DialogDescription>
            Select a list to add the {contactCount} selected contact(s) to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedAudienceList} value={selectedAudienceList}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a list..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : (
                availableAudienceLists?.map((list: AudienceList) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedAudienceList}>
            Add to List
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 