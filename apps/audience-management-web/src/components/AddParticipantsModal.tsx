import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useContacts } from '@stamina-project/frontend-hooks';
import { useDebounce } from '@stamina-project/frontend-hooks';
import { Contact } from '@stamina-project/types';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (contactIds: string[]) => void;
  audienceListName: string;
}

export function AddParticipantsModal({
  isOpen,
  onClose,
  onConfirm,
  audienceListName,
}: AddParticipantsModalProps) {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  const debouncedSearch = useDebounce(searchQuery, 300);

  const { data, isLoading } = useContacts({
    search: debouncedSearch,
    page: currentPage,
    limit,
  }, {
    enabled: isOpen,    
  });

  const contacts = data?.data ?? [];
  const totalContacts = data?.total ?? 0;
  const totalPages = Math.ceil(totalContacts / limit);

  const handleToggleContact = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selectedContacts);
    setSelectedContacts([]);
    setSearchQuery('');
  };

  // Reset state when modal is closed/reopened
  React.useEffect(() => {
    if (isOpen) {
      setSelectedContacts([]);
      setSearchQuery('');
      setCurrentPage(1);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Participants to "{audienceListName}"</DialogTitle>
          <DialogDescription>
            Search and select contacts to add to this audience list.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <Input
            placeholder="Search contacts by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <ScrollArea className="h-[300px] border rounded-md">
            <div className="divide-y">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-4 space-x-4">
                      <Skeleton className="w-5 h-5 rounded" />
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))
                : contacts.map((contact: Contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center p-4 space-x-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => handleToggleContact(contact.id)}
                    >
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => handleToggleContact(contact.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="font-medium">{contact.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {contact.email}
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
          </ScrollArea>
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 w-4 h-4" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={selectedContacts.length === 0}>
            Add {selectedContacts.length > 0 ? selectedContacts.length : ''}{' '}
            Contact(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 