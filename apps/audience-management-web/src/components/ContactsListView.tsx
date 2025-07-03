import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Contact } from '@stamina-project/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContactFilters } from '@/components/ContactFilters';
import { AudienceTable } from '@/components/AudienceTable';
import { useContactFilters } from '@stamina-project/frontend-hooks';

type ContactsListViewProps = {
  isAllContactsView: boolean;
  totalContacts: number;
  contacts: Contact[];
  isLoading: boolean;
  selectedContacts: string[];
  onSelectionChange: (contactId: string) => void;
  onSelectAll: () => void;
  onDeleteSelected: () => void;
  onEditSelected: (contactId: string) => void;
  onAddToAudienceList: () => void;
  onAddContact: () => void;
  isAudienceListView: boolean;
  onRemoveFromAudienceList: () => void;
  handleSort: (field: string) => void;
  sortField: keyof Contact | 'name';
  sortDirection: 'asc' | 'desc' | null;
  currentPage: number;
  totalPages: number;
  handlePreviousPage: () => void;
  handleNextPage: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchInputRef: React.Ref<HTMLInputElement>;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  contactFilters: ReturnType<typeof useContactFilters>;
};

export const ContactsListView: React.FC<ContactsListViewProps> = ({
  isAllContactsView,
  totalContacts,
  contacts,
  isLoading,
  selectedContacts,
  onSelectionChange,
  onSelectAll,
  onDeleteSelected,
  onEditSelected,
  onAddToAudienceList,
  onAddContact,
  isAudienceListView,
  onRemoveFromAudienceList,
  handleSort,
  sortField,
  sortDirection,
  currentPage,
  totalPages,
  handlePreviousPage,
  handleNextPage,
  searchQuery,
  setSearchQuery,
  searchInputRef,
  showFilters,
  setShowFilters,
  contactFilters,
}) => {
  const {
    sort,
    setSort,
    roleFilter,
    companyFilter,
    locationFilter,
    industryFilter,
    areFiltersActive,
    handleClearFilters,
  } = contactFilters;

  return (
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
          role={roleFilter.value}
          onRoleChange={roleFilter.setValue}
          onRoleSearchChange={roleFilter.onSearchChange}
          roleOptions={roleFilter.options}
          isRoleLoading={roleFilter.isLoading}
          roleSearch={roleFilter.searchTerm}
          hasMoreRoles={roleFilter.hasMore}
          onLoadMoreRoles={roleFilter.onLoadMore}
          industry={industryFilter.value}
          onIndustryChange={industryFilter.setValue}
          onIndustrySearchChange={industryFilter.onSearchChange}
          industryOptions={industryFilter.options}
          isIndustryLoading={industryFilter.isLoading}
          industrySearch={industryFilter.searchTerm}
          hasMoreIndustries={industryFilter.hasMore}
          onLoadMoreIndustries={industryFilter.onLoadMore}
          company={companyFilter.value}
          onCompanyChange={companyFilter.setValue}
          onCompanySearchChange={companyFilter.onSearchChange}
          companyOptions={companyFilter.options}
          isCompanyLoading={companyFilter.isLoading}
          companySearch={companyFilter.searchTerm}
          hasMoreCompanies={companyFilter.hasMore}
          onLoadMoreCompanies={companyFilter.onLoadMore}
          location={locationFilter.value}
          onLocationChange={locationFilter.setValue}
          onLocationSearchChange={locationFilter.onSearchChange}
          locationOptions={locationFilter.options}
          isLocationLoading={locationFilter.isLoading}
          locationSearch={locationFilter.searchTerm}
          hasMoreLocations={locationFilter.hasMore}
          onLoadMoreLocations={locationFilter.onLoadMore}
          areFiltersActive={areFiltersActive}
          onClearFilters={handleClearFilters}
        />
      )}

      <div className="overflow-hidden rounded-lg">
        <AudienceTable
          contacts={contacts}
          loading={isLoading}
          selectedContacts={selectedContacts}
          onSelectionChange={onSelectionChange}
          onSelectAll={onSelectAll}
          onDeleteSelected={onDeleteSelected}
          onEditSelected={onEditSelected}
          onAddToAudienceList={onAddToAudienceList}
          areFiltersActive={areFiltersActive}
          onAddContact={onAddContact}
          isAudienceListView={isAudienceListView}
          onRemoveFromAudienceList={onRemoveFromAudienceList}
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
  );
}; 