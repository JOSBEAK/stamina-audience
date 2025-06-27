import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Contact, Segment } from '@stamina-project/types';
import {
  useContacts,
  useAddContactsBatch,
  useDeleteContacts,
  useUpdateContact,
} from '@/hooks/useContacts';
import {
  useSegmentContacts,
  useAddContactsToSegment,
  useRemoveContactsFromSegment,
} from '@/hooks/useSegments';
import { AudienceTable } from '@/components/AudienceTable';
import AddAudienceModal from '@/components/AddAudienceModal';
import { AddManualForm } from '@/components/AddManualForm';
import UploadCsvModal from '@/components/UploadCsvModal';
import FieldMapping from '@/components/FieldMapping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { searchAttributes } from '@/utils/api';
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
import { ContactFilters } from '@/components/ContactFilters';
import { SegmentList } from '@/components/SegmentList';
import { AddToSegmentModal } from '@/components/AddToSegmentModal';
import { AddParticipantsModal } from '@/components/AddParticipantsModal';

type CsvRow = Record<string, string>;

type UseContactsParams = {
  search: string;
  page: number;
  limit: number;
  sort: string;
  role: string;
  company: string;
  location: string;
  industry: string;
};

const useGetContacts = (
  selectedSegmentId: string | null,
  params: UseContactsParams
) => {
  if (selectedSegmentId) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSegmentContacts(selectedSegmentId, params);
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useContacts(params);
};

export function ContactsPage() {
  const [view, setView] = useState('list');
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveFromSegmentDialogOpen, setIsRemoveFromSegmentDialogOpen] =
    useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sort, setSort] = useState('createdAt:desc');
  const [role, setRole] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [company, setCompany] = useState('');
  const [companySearch, setCompanySearch] = useState('');
  const [location, setLocation] = useState('');
  const [locationSearch, setLocationSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [industrySearch, setIndustrySearch] = useState('');
  const [roleOptions, setRoleOptions] = useState<{ label: string; value: string }[]>([]);
  const [companyOptions, setCompanyOptions] = useState<{ label: string; value: string }[]>([]);
  const [locationOptions, setLocationOptions] = useState<{ label: string; value: string }[]>([]);
  const [industryOptions, setIndustryOptions] = useState<{ label: string; value: string }[]>([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isIndustryLoading, setIsIndustryLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [isAddToSegmentModalOpen, setIsAddToSegmentModalOpen] = useState(false);
  const [newlyCreatedSegment, setNewlyCreatedSegment] = useState<Segment | null>(
    null
  );

  const limit = 10;

  const areFiltersActive =
    sort !== 'createdAt:desc' ||
    role !== '' ||
    company !== '' ||
    location !== '' ||
    industry !== '' ||
    searchQuery !== '';

  const debouncedCompanySearch = useDebounce(companySearch, 300);
  const debouncedLocationSearch = useDebounce(locationSearch, 300);
  const debouncedIndustrySearch = useDebounce(industrySearch, 300);
  const debouncedRoleSearch = useDebounce(roleSearch, 300);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const { data, isLoading } = useGetContacts(selectedSegmentId, {
    search: debouncedSearchQuery,
    page: currentPage,
    limit,
    sort,
    role,
    company,
    location,
    industry,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSegmentId]);

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

  useEffect(() => {
    if (debouncedRoleSearch) {
      setIsRoleLoading(true);
      searchAttributes('role', debouncedRoleSearch).then((roles) => {
        setRoleOptions(roles.map((r) => ({ label: r, value: r })));
        setIsRoleLoading(false);
      });
    } else {
      setRoleOptions([]);
    }
  }, [debouncedRoleSearch]);

  useEffect(() => {
    if (debouncedCompanySearch) {
      setIsCompanyLoading(true);
      searchAttributes('company', debouncedCompanySearch).then((companies) => {
        setCompanyOptions(companies.map((c) => ({ label: c, value: c })));
        setIsCompanyLoading(false);
      });
    } else {
      setCompanyOptions([]);
    }
  }, [debouncedCompanySearch]);

  useEffect(() => {
    if (debouncedLocationSearch) {
      setIsLocationLoading(true);
      searchAttributes('location', debouncedLocationSearch).then(
        (locations) => {
          setLocationOptions(locations.map((l) => ({ label: l, value: l })));
          setIsLocationLoading(false);
        }
      );
    } else {
      setLocationOptions([]);
    }
  }, [debouncedLocationSearch]);

  useEffect(() => {
    if (debouncedIndustrySearch) {
      setIsIndustryLoading(true);
      searchAttributes('industry', debouncedIndustrySearch).then(
        (industries) => {
          setIndustryOptions(industries.map((i) => ({ label: i, value: i })));
          setIsIndustryLoading(false);
        }
      );
    } else {
      setIndustryOptions([]);
    }
  }, [debouncedIndustrySearch]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSort('createdAt:desc');
    setRole('');
    setCompany('');
    setLocation('');
    setIndustry('');
    setCompanySearch('');
    setLocationSearch('');
    setIndustrySearch('');
    setRoleSearch('');
  };

  const addContactsMutation = useAddContactsBatch();
  const deleteContactsMutation = useDeleteContacts();
  const updateContactMutation = useUpdateContact();
  const addContactsToSegmentMutation = useAddContactsToSegment();
  const removeContactsFromSegmentMutation = useRemoveContactsFromSegment();

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

  const handleDataParsed = (data: CsvRow[], headers: string[]) => {
    setCsvData(data);
    setCsvHeaders(headers);
    setView('field_mapping');
  };

  const handleMappingConfirm = async (
    mappedData: Partial<Contact>[],
    segmentId?: string
  ) => {
    toast.promise(
      addContactsMutation.mutateAsync(mappedData).then((newContacts) => {
        if (segmentId && newContacts) {
          const contactIds = newContacts.map((c) => c.id);
          return addContactsToSegmentMutation.mutateAsync({
            segmentId,
            contactIds,
          });
        }
      }),
      {
        loading: 'Adding contacts...',
        success: 'Contacts added successfully!',
        error: 'Failed to add contacts.',
      }
    );
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
          id: editingContact.id,
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
      toast.promise(addContactsMutation.mutateAsync([contactData]), {
        loading: 'Adding contact...',
        success: () => {
          handleCloseForm();
          return 'Contact added successfully!';
        },
        error: 'Failed to add contact.',
      });
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

  const handleRemoveFromSegment = async () => {
    if (!selectedSegmentId) return;

    toast.promise(
      removeContactsFromSegmentMutation.mutateAsync({
        segmentId: selectedSegmentId,
        contactIds: selectedContacts,
      }),
      {
        loading: 'Removing contacts from segment...',
        success: () => {
          setSelectedContacts([]);
          setIsRemoveFromSegmentDialogOpen(false);
          return 'Contacts removed from segment successfully!';
        },
        error: 'Failed to remove contacts from segment.',
      }
    );
  };

  const handleAddToSegmentConfirm = (segmentId: string) => {
    toast.promise(
      addContactsToSegmentMutation.mutateAsync({
        segmentId,
        contactIds: selectedContacts,
      }),
      {
        loading: 'Adding contacts to segment...',
        success: () => {
          setIsAddToSegmentModalOpen(false);
          setSelectedContacts([]);
          return 'Contacts added to segment successfully!';
        },
        error: 'Failed to add contacts to segment.',
      }
    );
  };

  const handleSegmentCreated = (segment: Segment) => {
    setNewlyCreatedSegment(segment);
  };

  const handleAddParticipantsConfirm = (contactIds: string[]) => {
    if (!newlyCreatedSegment) return;

    toast.promise(
      addContactsToSegmentMutation.mutateAsync({
        segmentId: newlyCreatedSegment.id,
        contactIds,
      }),
      {
        loading: `Adding ${contactIds.length} contacts to "${newlyCreatedSegment.name}"...`,
        success: () => {
          setNewlyCreatedSegment(null); // Close the modal
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
          initialData={editingContact}
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
        />
      );
    }
    return null;
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

      <div className="flex">
        <SegmentList
          onSelectSegment={setSelectedSegmentId}
          selectedSegmentId={selectedSegmentId}
          onSegmentCreated={handleSegmentCreated}
        />
        <div className="flex-1 pl-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold">
                {selectedSegmentId ? 'Segment' : 'All Contacts'}
              </h1>
              <span className="text-sm text-muted-foreground ml-2 border border-border px-2 py-1 rounded-lg">
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
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                Filters
                {showFilters ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronUp className="w-3 h-3" />
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <ContactFilters
              sort={sort}
              onSortChange={setSort}
              role={role}
              onRoleChange={setRole}
              onRoleSearchChange={setRoleSearch}
              roleOptions={roleOptions}
              isRoleLoading={isRoleLoading}
              roleSearch={roleSearch}
              industry={industry}
              onIndustryChange={setIndustry}
              onIndustrySearchChange={setIndustrySearch}
              industryOptions={industryOptions}
              isIndustryLoading={isIndustryLoading}
              industrySearch={industrySearch}
              company={company}
              onCompanyChange={setCompany}
              onCompanySearchChange={setCompanySearch}
              companyOptions={companyOptions}
              isCompanyLoading={isCompanyLoading}
              companySearch={companySearch}
              location={location}
              onLocationChange={setLocation}
              onLocationSearchChange={setLocationSearch}
              locationOptions={locationOptions}
              isLocationLoading={isLocationLoading}
              locationSearch={locationSearch}
              areFiltersActive={areFiltersActive}
              onClearFilters={handleClearFilters}
            />
          )}

          <div className="border rounded-lg overflow-hidden">
            <AudienceTable
              contacts={contacts}
              loading={isLoading}
              selectedContacts={selectedContacts}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
              onDeleteSelected={() => setIsDeleteDialogOpen(true)}
              onEditSelected={handleEditSelected}
              onAddToSegment={() => setIsAddToSegmentModalOpen(true)}
              areFiltersActive={areFiltersActive}
              onAddContact={() => setView('add_selection')}
              isSegmentView={!!selectedSegmentId}
              onRemoveFromSegment={() => setIsRemoveFromSegmentDialogOpen(true)}
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
        </div>
      </div>

      {renderContent()}

      <AddParticipantsModal
        isOpen={!!newlyCreatedSegment}
        onClose={() => setNewlyCreatedSegment(null)}
        onConfirm={handleAddParticipantsConfirm}
        segmentName={newlyCreatedSegment?.name ?? ''}
      />

      <AddToSegmentModal
        isOpen={isAddToSegmentModalOpen}
        onClose={() => setIsAddToSegmentModalOpen(false)}
        onConfirm={handleAddToSegmentConfirm}
        contactCount={selectedContacts.length}
        currentSegmentId={selectedSegmentId}
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
        open={isRemoveFromSegmentDialogOpen}
        onOpenChange={setIsRemoveFromSegmentDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the selected contacts from this segment, but they
              will remain in your audience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveFromSegment}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
