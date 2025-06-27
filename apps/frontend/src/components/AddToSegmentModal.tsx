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
import { useSegments } from '@/hooks/useSegments';
import { Segment } from '@stamina-project/types';

interface AddToSegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (segmentId: string) => void;
  contactCount: number;
  currentSegmentId?: string | null;
}

export function AddToSegmentModal({
  isOpen,
  onClose,
  onConfirm,
  contactCount,
  currentSegmentId,
}: AddToSegmentModalProps) {
  const [selectedSegment, setSelectedSegment] = useState<string>('');
  const { data: segments, isLoading } = useSegments();

  const availableSegments = React.useMemo(() => {
    if (!segments) return [];
    return segments.filter((segment) => segment.id !== currentSegmentId);
  }, [segments, currentSegmentId]);

  const handleConfirm = () => {
    if (selectedSegment) {
      onConfirm(selectedSegment);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add to Segment</DialogTitle>
          <DialogDescription>
            Select a segment to add the {contactCount} selected contact(s) to.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Select onValueChange={setSelectedSegment} value={selectedSegment}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a segment..." />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  Loading...
                </SelectItem>
              ) : (
                availableSegments?.map((segment: Segment) => (
                  <SelectItem key={segment.id} value={segment.id}>
                    {segment.name}
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
          <Button onClick={handleConfirm} disabled={!selectedSegment}>
            Add to Segment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 