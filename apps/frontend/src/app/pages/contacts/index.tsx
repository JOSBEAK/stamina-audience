import React, { useState, useRef } from 'react';
import { Plus, Users, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Contact } from '@stamina-project/types';
import {
  useContacts,
  useAddContactsBatch,
  useDeleteContacts,
  useUpdateContact,
} from '@/hooks/useContacts';
import { AudienceTable } from '@/components/AudienceTable';
import AddAudienceModal from '@/components/AddAudienceModal';
import { AddManualForm } from '@/components/AddManualForm';
import UploadCsvModal from '@/components/UploadCsvModal';
import FieldMapping from '@/components/FieldMapping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
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

export function ContactsPage() {
  const [view, setView] = useState('list'); // 'list', 'add_selection', 'add_manual', 'upload_csv', 'field_mapping'
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const limit = 10;
  
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading } = useContacts({
    search: debouncedSearchQuery,
    page: currentPage,
    limit,
  });

  const addContactsMutation = useAddContactsBatch();
  const deleteContactsMutation = useDeleteContacts();
  const updateContactMutation = useUpdateContact();

  const contacts = data?.data ?? [];
  const totalContacts = data?.total ?? 0;
  const totalPages = Math.ceil(totalContacts / limit);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDataParsed = (data: any[], headers: string[]) => {
    setCsvData(data);
    setCsvHeaders(headers);
    setView('field_mapping');
  };

  const handleMappingConfirm = async (mappedData: Partial<Contact>[]) => {
    await addContactsMutation.mutateAsync(mappedData);
    setView('list');
  };

  const handleSelectionChange = (contactId: string) => {
    setSelectedContacts((prev) =>
      prev.includes(contactId)
        ? prev.filter((id) => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map((c) => c.id));
    }
  };

  const handleEditSelected = (contactId: string) => {
    const contactToEdit = contacts.find((c) => c.id === contactId);
    if (contactToEdit) {
      setEditingContact(contactToEdit);
      setView('add_manual');
    }
  };

  const handleCloseForm = () => {
    setEditingContact(null);
    setView('list');
  };

  const handleFormSubmit = async (contactData: Partial<Contact>) => {
    if (editingContact) {
      await updateContactMutation.mutateAsync({
        id: editingContact.id,
        contactData,
      });
    } else {
      await addContactsMutation.mutateAsync([contactData]);
    }
    handleCloseForm();
  };

  const handleDeleteSelected = async () => {
    await deleteContactsMutation.mutateAsync(selectedContacts, {
      onSuccess: () => {
        setSelectedContacts([]);
        setIsDeleteDialogOpen(false);
      },
    });
  };

  return (
    <div className="p-8 border border-border rounded-lg">
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-gray-500" />
          <h1 className="text-xl font-semibold">Audience</h1>
        </div>
        <Button onClick={() => setView('add_selection')}>
          <Plus size={18} className="mr-2" />
          Add People
        </Button>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Audience List</h1>
          <span className="text-sm text-gray-500 ml-2 border border-gray-200 px-2 py-1 rounded-full">
            {totalContacts} people
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative w-64">
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              className="w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 border rounded-md p-1">
              ⌘K
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <AudienceTable
          contacts={contacts}
          loading={isLoading}
          selectedContacts={selectedContacts}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
          onDeleteSelected={() => setIsDeleteDialogOpen(true)}
          onEditSelected={handleEditSelected}
        />
      </div>

      <div className="flex justify-between items-center mt-4">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Page {totalContacts > 0 ? currentPage : 0} of {totalPages}
        </span>
        <Button
          variant="default"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {view === 'add_selection' && (
        <AddAudienceModal
          onClose={() => setView('list')}
          onAddManually={() => setView('add_manual')}
          onUploadCsv={() => setView('upload_csv')}
        />
      )}

      {view === 'add_manual' && (
        <AddManualForm
          onClose={handleCloseForm}
          onContactSubmit={handleFormSubmit}
          initialData={editingContact}
        />
      )}

      {view === 'upload_csv' && (
        <UploadCsvModal
          onClose={() => setView('list')}
          onDataParsed={handleDataParsed}
        />
      )}

      {view === 'field_mapping' && (
        <FieldMapping
          onClose={() => setView('list')}
          onConfirm={handleMappingConfirm}
          csvData={csvData}
          csvHeaders={csvHeaders}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              <div className="flex items-center gap-2">
                <AlertTriangle className="text-destructive" />
                Are you sure you want to delete?
              </div>
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedContacts.length} contact(s). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSelected}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 