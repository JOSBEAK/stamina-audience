import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';

type CsvRow = Record<string, string>;

export function ContactsPage() {
  const [view, setView] = useState('list'); // 'list', 'add_selection', 'add_manual', 'upload_csv', 'field_mapping'
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [companyOptions, setCompanyOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [locationOptions, setLocationOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [industryOptions, setIndustryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isIndustryLoading, setIsIndustryLoading] = useState(false);
  const [isRoleLoading, setIsRoleLoading] = useState(false);

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

  const { data, isLoading } = useContacts({
    search: debouncedSearchQuery,
    page: currentPage,
    limit,
    sort,
    role,
    company,
    location,
    industry,
  });

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

  const handleMappingConfirm = async (mappedData: Partial<Contact>[]) => {
    toast.promise(addContactsMutation.mutateAsync(mappedData), {
      loading: 'Adding contacts...',
      success: 'Contacts added successfully!',
      error: 'Failed to add contacts.',
    });
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
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start space-x-8 mb-4 p-4 bg-gray-50 rounded-lg w-full">
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Sort by</label>
              <div className="flex items-center space-x-1 relative">
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value || 'createdAt:desc')}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt:desc">Newest</SelectItem>
                    <SelectItem value="createdAt:asc">Oldest</SelectItem>
                    <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
                {sort !== 'createdAt:desc' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                    onClick={() => setSort('createdAt:desc')}
                  >
                    <X className="h-3 w-3 text-white" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Role</label>
              <div className="flex items-center space-x-1 relative">
                <Combobox
                  value={role}
                  onChange={setRole}
                  onInputChange={setRoleSearch}
                  options={roleOptions}
                  placeholder="Select role..."
                  searchPlaceholder="Search roles..."
                  emptyPlaceholder={
                    roleSearch.length > 0
                      ? 'No roles found.'
                      : 'Roles will show up here'
                  }
                  loading={isRoleLoading}
                />
                {role && (
                  <Button
                    variant="default"
                    size="icon"
                    className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                    onClick={() => setRole('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <div className="flex items-center space-x-1 relative">
                <Combobox
                  value={industry}
                  onChange={setIndustry}
                  onInputChange={setIndustrySearch}
                  options={industryOptions}
                  placeholder="Select industry..."
                  searchPlaceholder="Search industries..."
                  emptyPlaceholder={
                    industrySearch
                      ? 'No industries found.'
                      : 'Industries will show up here'
                  }
                  loading={isIndustryLoading}
                />
                {industry && (
                  <Button
                    variant="default"
                    size="icon"
                    className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                    onClick={() => setIndustry('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Company</label>
              <div className="flex items-center space-x-1 relative">
                <Combobox
                  value={company}
                  onChange={setCompany}
                  onInputChange={setCompanySearch}
                  options={companyOptions}
                  placeholder="Select company..."
                  searchPlaceholder="Search companies..."
                  emptyPlaceholder={
                    companySearch.length > 0
                      ? 'No companies found.'
                      : 'Companies will show up here'
                  }
                  loading={isCompanyLoading}
                />
                {company && (
                  <Button
                    variant="default"
                    size="icon"
                    className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                    onClick={() => setCompany('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="flex items-center space-x-1 relative">
                <Combobox
                  value={location}
                  onChange={setLocation}
                  onInputChange={setLocationSearch}
                  options={locationOptions}
                  placeholder="Select location..."
                  searchPlaceholder="Search locations..."
                  emptyPlaceholder={
                    locationSearch.length > 0
                      ? 'No locations found.'
                      : 'Locations will show up here'
                  }
                  loading={isLocationLoading}
                />
                {location && (
                  <Button
                    variant="default"
                    size="icon"
                    className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                    onClick={() => setLocation('')}
                  >
                    <X className="h-3 w-3 " />
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center">
            {areFiltersActive && (
              <Button
                variant="default"
                onClick={handleClearFilters}
                className="text-sm text-white bg-red-500 w-24"
              >
                Clear All
              </Button>
            )}
          </div>
        </div>
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
          areFiltersActive={areFiltersActive}
          onAddContact={() => setView('add_selection')}
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

      {renderContent()}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              selected contacts.
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
    </div>
  );
}
