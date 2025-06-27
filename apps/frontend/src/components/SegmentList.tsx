import React, { useState } from 'react';
import { useSegments, useCreateSegment } from '@/hooks/useSegments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { List, Plus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Segment } from '@stamina-project/types';

interface SegmentListProps {
  onSelectSegment: (segmentId: string | null) => void;
  selectedSegmentId: string | null;
  onSegmentCreated: (segment: Segment) => void;
}

export function SegmentList({
  onSelectSegment,
  selectedSegmentId,
  onSegmentCreated,
}: SegmentListProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSegmentName, setNewSegmentName] = useState('');
  const { data: segments, isLoading } = useSegments();
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
        return 'Segment created successfully! Now add some participants.';
      },
      error: 'Failed to create segment.',
    });
  };

  return (
    <div className="w-64 border-r border-border pr-4">
      <h2 className="text-lg font-semibold flex items-center mb-4">
        <List className="mr-2 h-5 w-5" />
        Segments
      </h2>
      <div
        className={`flex items-center p-2 rounded-lg cursor-pointer ${!selectedSegmentId ? 'bg-muted' : 'hover:bg-muted/50'}`}
        onClick={() => onSelectSegment(null)}
      >
        <Users className="mr-2 h-4 w-4" />
        <span>All Contacts</span>
      </div>
      {isLoading && <div className="p-2">Loading segments...</div>}
      <ul className="space-y-1 mt-2">
        {segments?.map((segment: Segment) => (
          <li
            key={segment.id}
            className={`p-2 rounded-lg cursor-pointer ${selectedSegmentId === segment.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
            onClick={() => onSelectSegment(segment.id)}
          >
            {segment.name}
            {/* We will use the memberCount later */}
            {/* <span className="text-sm text-muted-foreground ml-2">{segment.memberCount || 0}</span> */}
          </li>
        ))}
      </ul>
      {isCreating ? (
        <div className="mt-4 space-y-2">
          <Input
            placeholder="New segment name"
            value={newSegmentName}
            onChange={(e) => setNewSegmentName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateSegment()}
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateSegment}>
              Create
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => setIsCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      )}
    </div>
  );
} 