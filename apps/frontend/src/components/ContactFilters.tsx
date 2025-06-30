import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import { Button } from '@/components/ui/button';
import { ClearButton } from './ui/clear-button';

interface ContactFiltersProps {
  sort: string;
  onSortChange: (value: string) => void;

  role: string;
  onRoleChange: (value: string) => void;
  onRoleSearchChange: (value: string) => void;
  roleOptions: { label: string; value: string }[];
  isRoleLoading: boolean;
  roleSearch: string;
  onLoadMoreRoles: () => void;
  hasMoreRoles: boolean;

  industry: string;
  onIndustryChange: (value: string) => void;
  onIndustrySearchChange: (value: string) => void;
  industryOptions: { label: string; value: string }[];
  isIndustryLoading: boolean;
  industrySearch: string;
  onLoadMoreIndustries: () => void;
  hasMoreIndustries: boolean;

  company: string;
  onCompanyChange: (value: string) => void;
  onCompanySearchChange: (value: string) => void;
  companyOptions: { label: string; value: string }[];
  isCompanyLoading: boolean;
  companySearch: string;
  onLoadMoreCompanies: () => void;
  hasMoreCompanies: boolean;

  location: string;
  onLocationChange: (value: string) => void;
  onLocationSearchChange: (value: string) => void;
  locationOptions: { label: string; value: string }[];
  isLocationLoading: boolean;
  locationSearch: string;
  onLoadMoreLocations: () => void;
  hasMoreLocations: boolean;

  areFiltersActive: boolean;
  onClearFilters: () => void;
}

export function ContactFilters({
  sort,
  onSortChange,
  role,
  onRoleChange,
  onRoleSearchChange,
  roleOptions,
  isRoleLoading,
  roleSearch,
  onLoadMoreRoles,
  hasMoreRoles,
  industry,
  onIndustryChange,
  onIndustrySearchChange,
  industryOptions,
  isIndustryLoading,
  industrySearch,
  onLoadMoreIndustries,
  hasMoreIndustries,
  company,
  onCompanyChange,
  onCompanySearchChange,
  companyOptions,
  isCompanyLoading,
  companySearch,
  onLoadMoreCompanies,
  hasMoreCompanies,
  location,
  onLocationChange,
  onLocationSearchChange,
  locationOptions,
  isLocationLoading,
  locationSearch,
  onLoadMoreLocations,
  hasMoreLocations,
  areFiltersActive,
  onClearFilters,
}: ContactFiltersProps) {
  return (
    <div className="flex justify-between items-end p-4 mb-4 w-full rounded-lg">
      <div className="flex justify-start items-end space-x-8">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Role</label>
          <div className="flex relative items-center space-x-1">
            <Combobox
              value={role}
              onChange={onRoleChange}
              onInputChange={onRoleSearchChange}
              options={roleOptions}
              placeholder="Select role..."
              searchPlaceholder="Search roles..."
              emptyPlaceholder={
                roleSearch.length > 0
                  ? 'No roles found.'
                  : 'Roles will show up here'
              }
              loading={isRoleLoading}
              onLoadMore={onLoadMoreRoles}
              hasMore={hasMoreRoles}
            />
            {role && <ClearButton onClick={() => onRoleChange('')} />}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Industry</label>
          <div className="flex relative items-center space-x-1">
            <Combobox
              value={industry}
              onChange={onIndustryChange}
              onInputChange={onIndustrySearchChange}
              options={industryOptions}
              placeholder="Select industry..."
              searchPlaceholder="Search industries..."
              emptyPlaceholder={
                industrySearch
                  ? 'No industries found.'
                  : 'Industries will show up here'
              }
              loading={isIndustryLoading}
              onLoadMore={onLoadMoreIndustries}
              hasMore={hasMoreIndustries}
            />
            {industry && <ClearButton onClick={() => onIndustryChange('')} />}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Company</label>
          <div className="flex relative items-center space-x-1">
            <Combobox
              value={company}
              onChange={onCompanyChange}
              onInputChange={onCompanySearchChange}
              options={companyOptions}
              placeholder="Select company..."
              searchPlaceholder="Search companies..."
              emptyPlaceholder={
                companySearch.length > 0
                  ? 'No companies found.'
                  : 'Companies will show up here'
              }
              loading={isCompanyLoading}
              onLoadMore={onLoadMoreCompanies}
              hasMore={hasMoreCompanies}
            />
            {company && <ClearButton onClick={() => onCompanyChange('')} />}
          </div>
        </div>
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Location</label>
          <div className="flex relative items-center space-x-1">
            <Combobox
              value={location}
              onChange={onLocationChange}
              onInputChange={onLocationSearchChange}
              options={locationOptions}
              placeholder="Select location..."
              searchPlaceholder="Search locations..."
              emptyPlaceholder={
                locationSearch.length > 0
                  ? 'No locations found.'
                  : 'Locations will show up here'
              }
              loading={isLocationLoading}
              onLoadMore={onLoadMoreLocations}
              hasMore={hasMoreLocations}
            />
            {location && <ClearButton onClick={() => onLocationChange('')} />}
          </div>
        </div>
      </div>
      <div className="flex items-end">
        {areFiltersActive && (
          <Button
            variant="destructive"
            onClick={onClearFilters}
            className="w-24 text-sm text-white"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
} 