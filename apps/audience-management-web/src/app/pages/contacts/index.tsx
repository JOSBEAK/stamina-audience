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
import {  AudienceList } from '@stamina-project/types';
import { Contact } from '@stamina-project/api-client';
import {
  useContacts,
  useDeleteContacts,
  useUpdateContact,
  useCreateContact,
} from '@stamina-project/frontend-hooks';
import {
  useAudienceListContacts,
  useAddContactsToAudienceList,
  useRemoveContactsFromAudienceList,
} from '@stamina-project/frontend-hooks';
import { AudienceTable } from '@/components/AudienceTable';
import AddAudienceModal from '@/components/AddAudienceModal';
import { AddManualForm } from '@/components/AddManualForm';
import UploadCsvModal from '@/components/UploadCsvModal';
import FieldMapping from '@/components/FieldMapping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@stamina-project/frontend-hooks';
import { searchAttributes, getPresignedUrl, processCsv } from '@stamina-project/api-client';
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
import { AudienceLists } from '@/components/AudienceLists';
import { AddToAudienceListModal } from '@/components/AddToAudienceListModal';
import { AddParticipantsModal } from '@/components/AddParticipantsModal';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePrefetch } from '@stamina-project/frontend-hooks';
import { CsvRowData } from '@stamina-project/types';

// type UseContactsParams = {
//   search: string;
//   page: number;
//   limit: number;
//   sort: string;
//   role: string;
//   company: string;
//   location: string;
//   industry: string;
// };

export function ContactsPage() {
  const { audienceListId } = useParams<{ audienceListId: string }>();
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [view, setView] = useState('list');
  const [csvData, setCsvData] = useState<CsvRowData[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRemoveFromAudienceListDialogOpen, setIsRemoveFromAudienceListDialogOpen] =
    useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact> | null>(null);
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
  const [isAddToAudienceListModalOpen, setIsAddToAudienceListModalOpen] = useState(false);
  const [newlyCreatedAudienceList, setNewlyCreatedAudienceList] = useState<AudienceList | null>(
    null
  );

  const [rolePage, setRolePage] = useState(1);
  const [companyPage, setCompanyPage] = useState(1);
  const [locationPage, setLocationPage] = useState(1);
  const [industryPage, setIndustryPage] = useState(1);

  const [hasMoreRoles, setHasMoreRoles] = useState(true);
  const [hasMoreCompanies, setHasMoreCompanies] = useState(true);
  const [hasMoreLocations, setHasMoreLocations] = useState(true);
  const [hasMoreIndustries, setHasMoreIndustries] = useState(true);

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
  }, [sortField, sortDirection]);

  usePrefetch();

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

  const isAllContactsView = routeLocation.pathname === '/contacts/all';
  const isAudienceListView = routeLocation.pathname === '/contacts';

  const listParams = {
    search: debouncedSearchQuery,
    page: currentPage,
    limit,
    sort,
    role,
    company,
    location,
    industry,
  };

  const { data: audienceListContactsData, isLoading: isAudienceListContactsLoading } =
    useAudienceListContacts(audienceListId, listParams, {
      enabled: !!audienceListId,
    });

  const { data: allContactsData, isLoading: isAllContactsLoading } =
    useContacts(listParams, {
      enabled: isAllContactsView,
    });

  const data = isAllContactsView ? allContactsData : audienceListContactsData;
  const isLoading = isAllContactsView
    ? isAllContactsLoading
    : isAudienceListContactsLoading;

  useEffect(() => {
    setCurrentPage(1);
  }, [audienceListId]);

  const { data: prefetchedData } = usePrefetch();
  
  useEffect(() => {
    if (prefetchedData) {
      if (Array.isArray(prefetchedData.role)) {
        setRoleOptions(
          prefetchedData.role.map((r) => ({ label: r, value: r }))
        );
      }
      if (Array.isArray(prefetchedData.company)) {
        setCompanyOptions(
          prefetchedData.company.map((c) => ({ label: c, value: c }))
        );
      }
      if (Array.isArray(prefetchedData.location)) {
        setLocationOptions(
          prefetchedData.location.map((l) => ({ label: l, value: l }))
        );
      }
      if (Array.isArray(prefetchedData.industry)) {
        setIndustryOptions(
          prefetchedData.industry.map((i) => ({ label: i, value: i }))
        );
      }
    }
  }, [prefetchedData]);

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
    setIsRoleLoading(true);
    searchAttributes('role', debouncedRoleSearch, 5, rolePage).then((roles) => {
      const newOptions = roles.map((r) => ({ label: r, value: r }));
      if (rolePage === 1) {
        setRoleOptions(newOptions);
      } else {
        setRoleOptions((prev) => [...prev, ...newOptions]);
      }
      setHasMoreRoles(newOptions.length === 5);
      setIsRoleLoading(false);
    });
  }, [debouncedRoleSearch, rolePage]);

  useEffect(() => {
    setIsCompanyLoading(true);
    searchAttributes('company', debouncedCompanySearch, 5, companyPage).then(
      (companies) => {
        const newOptions = companies.map((c) => ({ label: c, value: c }));
        if (companyPage === 1) {
          setCompanyOptions(newOptions);
        } else {
          setCompanyOptions((prev) => [...prev, ...newOptions]);
        }
        setHasMoreCompanies(newOptions.length === 5);
        setIsCompanyLoading(false);
      }
    );
  }, [debouncedCompanySearch, companyPage]);

  useEffect(() => {
    setIsLocationLoading(true);
    searchAttributes('location', debouncedLocationSearch, 5, locationPage).then(
      (locations) => {
        const newOptions = locations.map((l) => ({ label: l, value: l }));
        if (locationPage === 1) {
          setLocationOptions(newOptions);
        } else {
          setLocationOptions((prev) => [...prev, ...newOptions]);
        }
        setHasMoreLocations(newOptions.length === 5);
        setIsLocationLoading(false);
      }
    );
  }, [debouncedLocationSearch, locationPage]);

  useEffect(() => {
    setIsIndustryLoading(true);
    searchAttributes(
      'industry',
      debouncedIndustrySearch,
      5,
      industryPage
    ).then((industries) => {
      const newOptions = industries.map((i) => ({ label: i, value: i }));
      if (industryPage === 1) {
        setIndustryOptions(newOptions);
      } else {
        setIndustryOptions((prev) => [...prev, ...newOptions]);
      }
      setHasMoreIndustries(newOptions.length === 5);
      setIsIndustryLoading(false);
    });
  }, [debouncedIndustrySearch, industryPage]);

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
    setRolePage(1);
    setCompanyPage(1);
    setLocationPage(1);
    setIndustryPage(1);
  };

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
        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold">
                {isAllContactsView ? 'All Contacts' : 'List'}
              </h1>
              <span className="px-2 py-1 ml-2 text-sm rounded-lg border text-muted-foreground border-border">
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
                <div className="absolute right-2 top-1/2 p-1 text-xs text-gray-400 rounded-md border -translate-y-1/2">
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
              onRoleSearchChange={(search) => {
                setRoleSearch(search);
                setRolePage(1);
              }}
              roleOptions={roleOptions}
              isRoleLoading={isRoleLoading}
              roleSearch={roleSearch}
              hasMoreRoles={hasMoreRoles}
              onLoadMoreRoles={() => setRolePage((p) => p + 1)}
              industry={industry}
              onIndustryChange={setIndustry}
              onIndustrySearchChange={(search) => {
                setIndustrySearch(search);
                setIndustryPage(1);
              }}
              industryOptions={industryOptions}
              isIndustryLoading={isIndustryLoading}
              industrySearch={industrySearch}
              hasMoreIndustries={hasMoreIndustries}
              onLoadMoreIndustries={() => setIndustryPage((p) => p + 1)}
              company={company}
              onCompanyChange={setCompany}
              onCompanySearchChange={(search) => {
                setCompanySearch(search);
                setCompanyPage(1);
              }}
              companyOptions={companyOptions}
              isCompanyLoading={isCompanyLoading}
              companySearch={companySearch}
              hasMoreCompanies={hasMoreCompanies}
              onLoadMoreCompanies={() => setCompanyPage((p) => p + 1)}
              location={location}
              onLocationChange={setLocation}
              onLocationSearchChange={(search) => {
                setLocationSearch(search);
                setLocationPage(1);
              }}
              locationOptions={locationOptions}
              isLocationLoading={isLocationLoading}
              locationSearch={locationSearch}
              hasMoreLocations={hasMoreLocations}
              onLoadMoreLocations={() => setLocationPage((p) => p + 1)}
              areFiltersActive={areFiltersActive}
              onClearFilters={handleClearFilters}
            />
          )}

          <div className="overflow-hidden rounded-lg">
            <AudienceTable
              contacts={contacts}
              loading={isLoading}
              selectedContacts={selectedContacts}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
              onDeleteSelected={() => setIsDeleteDialogOpen(true)}
              onEditSelected={handleEditSelected}
              onAddToAudienceList={() => setIsAddToAudienceListModalOpen(true)}
              areFiltersActive={areFiltersActive}
              onAddContact={() => setView('add_manual')}
              isAudienceListView={!!audienceListId}
              onRemoveFromAudienceList={() => setIsRemoveFromAudienceListDialogOpen(true)}
              onSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <Button
              variant="outline"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="mr-2 w-4 h-4" />
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
              <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
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
