import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { AudienceList } from '@stamina-project/types';
import { Contact } from '@stamina-project/api-client';
import {
  useContacts,
  useDeleteContacts,
  useUpdateContact,
  useCreateContact,
  useContactFilters,
} from '@stamina-project/frontend-hooks';
import {
  useAudienceListContacts,
  useAddContactsToAudienceList,
  useRemoveContactsFromAudienceList,
} from '@stamina-project/frontend-hooks';
import AddAudienceModal from '@/components/AddAudienceModal';
import { AddManualForm } from '@/components/AddManualForm';
import UploadCsvModal from '@/components/UploadCsvModal';
import FieldMapping from '@/components/FieldMapping';
import { Button } from '@/components/ui/button';
import { getPresignedUrl, processCsv } from '@stamina-project/api-client';
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
import { AudienceLists } from '@/components/AudienceLists';
import { AddToAudienceListModal } from '@/components/AddToAudienceListModal';
import { AddParticipantsModal } from '@/components/AddParticipantsModal';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePrefetch } from '@stamina-project/frontend-hooks';
import { CsvRowData } from '@stamina-project/types';
import { ContactsListView } from '@/components/ContactsListView';

export function ContactsPage() {
  const { audienceListId } = useParams<{ audienceListId: string }>();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [view, setView] = useState('list');
  const [csvData, setCsvData] = useState<CsvRowData[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveFromAudienceListDialogOpen, setIsRemoveFromAudienceListDialogOpen] =
    useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [isAddToAudienceListModalOpen, setIsAddToAudienceListModalOpen] = useState(false);
  const [newlyCreatedAudienceList, setNewlyCreatedAudienceList] = useState<AudienceList | null>(
    null
  );

  const contactFilters = useContactFilters();
  const { listParams, searchQuery, setSearchQuery, setSort } = contactFilters;

  const [sortField, setSortField] = useState<keyof Contact | 'name'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(
    'desc'
  );

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(
        sortDirection === 'desc' ? 'asc' : sortDirection === 'asc' ? null : 'desc'
      );
    } else {
      setSortField(field as keyof Contact);
      setSortDirection('desc');
    }
  };

  useEffect(() => {
    if (sortField && sortDirection) {
      setSort(`${sortField}:${sortDirection}`);
    } else {
      setSort('createdAt:desc');
    }
  }, [sortField, sortDirection, setSort]);

  usePrefetch();

  const limit = 10;

  const isAllContactsView = routeLocation.pathname === '/contacts/all';
  const isAudienceListView = routeLocation.pathname === '/contacts';

  const finalParams = { ...listParams, page: currentPage, limit };

  const { data: audienceListContactsData, isLoading: isAudienceListContactsLoading } =
    useAudienceListContacts(audienceListId, finalParams, {
      enabled: !!audienceListId,
    });

  const { data: allContactsData, isLoading: isAllContactsLoading } =
    useContacts(finalParams, {
      enabled: isAllContactsView,
    });

  const data = isAllContactsView ? allContactsData : audienceListContactsData;
  const isLoading = isAllContactsView
    ? isAllContactsLoading
    : isAudienceListContactsLoading;

  useEffect(() => {
    setCurrentPage(1);
  }, [audienceListId, listParams]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const createContactMutation = useCreateContact();
  const deleteContactsMutation = useDeleteContacts();
  const updateContactMutation = useUpdateContact();
  const addContactsToAudienceListMutation = useAddContactsToAudienceList();
  const removeContactsFromAudienceListMutation = useRemoveContactsFromAudienceList();

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

  const handleDataParsed = (data: CsvRowData[], headers: string[], file: File) => {
    setCsvData(data);
    setCsvHeaders(headers);
    setCsvFile(file);
    setView('field_mapping');
  };

  const handleMappingConfirm = async (
    mapping: Record<string, string>,
    audienceListId?: string
  ) => {
    if (!csvFile) {
      toast.error('No CSV file found to upload.');
      return;
    }

    const uploadPromise = async () => {
      try {
        const { presignedUrl, fileKey } = await getPresignedUrl(
          csvFile.name,
          csvFile.type
        );

        await fetch(presignedUrl, {
          method: 'PUT',
          body: csvFile,
          headers: { 'Content-Type': csvFile.type },
        });

        await processCsv({
          fileKey,
          mapping,
          audienceListId,
        });
      } catch (error) {
        console.error('CSV Upload failed:', error);
        throw error;
      }
    };

    toast.promise(uploadPromise(), {
      loading: 'Uploading and queueing CSV for processing...',
      success:
        'File uploaded successfully! Contacts are being processed in the background.',
      error: 'An error occurred during the upload process.',
    });

    setView('list');
    setSelectedContacts([]);
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
      toast.promise(
        updateContactMutation.mutateAsync({
          id: editingContact.id ?? '',
          contactData,
        }),
        {
          loading: 'Updating contact...',
          success: () => {
            handleCloseForm();
            return 'Contact updated successfully!';
          },
          error: 'Failed to update contact.',
        }
      );
    } else {
      toast.promise(
        createContactMutation.mutateAsync(contactData).then((newContact) => {
          if (audienceListId && newContact) {
            return addContactsToAudienceListMutation.mutateAsync({
              audienceListId,
              contactIds: [newContact.id],
            });
          }
        }),
        {
          loading: 'Adding contact...',
          success: () => {
            handleCloseForm();
            return audienceListId
              ? 'Contact added and added to list!'
              : 'Contact added successfully!';
          },
          error: 'Failed to add contact.',
        }
      );
    }
  };

  const handleDeleteSelected = async () => {
    toast.promise(deleteContactsMutation.mutateAsync(selectedContacts), {
      loading: 'Deleting contacts...',
      success: () => {
        setSelectedContacts([]);
        setIsDeleteDialogOpen(false);
        return 'Contacts deleted successfully!';
      },
      error: 'Failed to delete contacts.',
    });
  };

  const handleRemoveFromAudienceList = async () => {
    if (!audienceListId) return;

    toast.promise(
      removeContactsFromAudienceListMutation.mutateAsync({
        audienceListId: audienceListId,
        contactIds: selectedContacts,
      }),
      {
        loading: 'Removing contacts from list...',
        success: () => {
          setSelectedContacts([]);
          setIsRemoveFromAudienceListDialogOpen(false);
          return 'Contacts removed from list successfully!';
        },
        error: 'Failed to remove contacts from list.',
      }
    );
  };

  const handleAddToAudienceListConfirm = (audienceListId: string) => {
    toast.promise(
      addContactsToAudienceListMutation.mutateAsync({
        audienceListId,
        contactIds: selectedContacts,
      }),
      {
        loading: 'Adding contacts to list...',
        success: () => {
          setIsAddToAudienceListModalOpen(false);
          setSelectedContacts([]);
          return 'Contacts added to list successfully!';
        },
        error: 'Failed to add contacts to list.',
      }
    );
  };

  const handleAudienceListCreated = (audienceList: AudienceList) => {
    setNewlyCreatedAudienceList(audienceList);
  };

  const handleAddParticipantsConfirm = (contactIds: string[]) => {
    if (!newlyCreatedAudienceList) return;

    toast.promise(
      addContactsToAudienceListMutation.mutateAsync({
        audienceListId: newlyCreatedAudienceList.id,
        contactIds,
      }),
      {
        loading: `Adding ${contactIds.length} contacts to "${newlyCreatedAudienceList.name}"...`,
        success: () => {
          setNewlyCreatedAudienceList(null); // Close the modal
          return 'Contacts added successfully!';
        },
        error: 'Failed to add contacts.',
      }
    );
  };

  const renderContent = () => {
    if (view === 'add_selection') {
      return (
        <AddAudienceModal
          onClose={() => setView('list')}
          onAddManually={() => setView('add_manual')}
          onUploadCsv={() => setView('upload_csv')}
        />
      );
    }
    if (view === 'add_manual') {
      return (
        <AddManualForm
          onClose={handleCloseForm}
          onContactSubmit={handleFormSubmit}
          initialData={editingContact as Contact}
        />
      );
    }
    if (view === 'upload_csv') {
      return (
        <UploadCsvModal
          onClose={() => setView('list')}
          onDataParsed={handleDataParsed}
        />
      );
    }
    if (view === 'field_mapping') {
      return (
        <FieldMapping
          csvHeaders={csvHeaders}
          csvData={csvData}
          onConfirm={handleMappingConfirm}
          onClose={() => setView('list')}
          currentAudienceListId={audienceListId}
        />
      );
    }
    return null;
  };

  if (isAudienceListView) {
    return (
      <div className="p-8 rounded-lg border border-border">
        <div className="flex justify-between items-center pb-4 mb-4 border-b">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-gray-500" />
            <h1 className="text-xl font-semibold">Audience Lists</h1>
          </div>
          <Button onClick={() => setView('add_selection')}>
            <Plus size={18} className="mr-2" />
            Add People
          </Button>
        </div>
        <AudienceLists
          onSelectAudienceList={(id) =>
            id ? navigate(`/contacts/audience-lists/${id}`) : navigate('/contacts/all')
          }
          onAudienceListCreated={handleAudienceListCreated}
        />
        {renderContent()}
        <AddParticipantsModal
          isOpen={!!newlyCreatedAudienceList}
          onClose={() => setNewlyCreatedAudienceList(null)}
          onConfirm={handleAddParticipantsConfirm}
          audienceListName={newlyCreatedAudienceList?.name ?? ''}
        />
      </div>
    );
  }

  return (
    <div className="p-8 rounded-lg border border-border">
      <div className="flex justify-between items-center pb-4 mb-4 border-b">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6 text-gray-500" />
          <h1 className="text-xl font-semibold">Audience</h1>
        </div>
        <Button onClick={() => setView('add_selection')}>
          <Plus size={18} className="mr-2" />
          Add People
        </Button>
      </div>

      <div className="flex">
        <ContactsListView
          isAllContactsView={isAllContactsView}
          totalContacts={totalContacts}
          contacts={contacts}
          isLoading={isLoading}
          selectedContacts={selectedContacts}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
          onDeleteSelected={() => setIsDeleteDialogOpen(true)}
          onEditSelected={handleEditSelected}
          onAddToAudienceList={() => setIsAddToAudienceListModalOpen(true)}
          onAddContact={() => setView('add_manual')}
          isAudienceListView={!!audienceListId}
          onRemoveFromAudienceList={() => setIsRemoveFromAudienceListDialogOpen(true)}
          handleSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePreviousPage={handlePreviousPage}
          handleNextPage={handleNextPage}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchInputRef={searchInputRef}
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          contactFilters={contactFilters}
        />
      </div>

      {renderContent()}

      <AddParticipantsModal
        isOpen={view === 'add-participants-to-list'}
        onClose={() => setView('list')}
        onConfirm={handleAddParticipantsConfirm}
        audienceListName={newlyCreatedAudienceList?.name ?? ''}
      />

      <AddToAudienceListModal
        isOpen={isAddToAudienceListModalOpen}
        onClose={() => setIsAddToAudienceListModalOpen(false)}
        onConfirm={handleAddToAudienceListConfirm}
        contactCount={selectedContacts.length}
        currentAudienceListId={audienceListId}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected contacts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={isRemoveFromAudienceListDialogOpen}
        onOpenChange={setIsRemoveFromAudienceListDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the selected contacts from this list, but they
              will remain in your audience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFromAudienceList}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
