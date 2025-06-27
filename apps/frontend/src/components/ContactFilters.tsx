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
import { X } from 'lucide-react';

interface ContactFiltersProps {
  sort: string;
  onSortChange: (value: string) => void;

  role: string;
  onRoleChange: (value: string) => void;
  onRoleSearchChange: (value: string) => void;
  roleOptions: { label: string; value: string }[];
  isRoleLoading: boolean;
  roleSearch: string;

  industry: string;
  onIndustryChange: (value: string) => void;
  onIndustrySearchChange: (value: string) => void;
  industryOptions: { label: string; value: string }[];
  isIndustryLoading: boolean;
  industrySearch: string;

  company: string;
  onCompanyChange: (value: string) => void;
  onCompanySearchChange: (value: string) => void;
  companyOptions: { label: string; value: string }[];
  isCompanyLoading: boolean;
  companySearch: string;

  location: string;
  onLocationChange: (value: string) => void;
  onLocationSearchChange: (value: string) => void;
  locationOptions: { label: string; value: string }[];
  isLocationLoading: boolean;
  locationSearch: string;

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
  industry,
  onIndustryChange,
  onIndustrySearchChange,
  industryOptions,
  isIndustryLoading,
  industrySearch,
  company,
  onCompanyChange,
  onCompanySearchChange,
  companyOptions,
  isCompanyLoading,
  companySearch,
  location,
  onLocationChange,
  onLocationSearchChange,
  locationOptions,
  isLocationLoading,
  locationSearch,
  areFiltersActive,
  onClearFilters,
}: ContactFiltersProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-start space-x-8 mb-4 p-4 bg-gray-50 rounded-lg w-full">
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium">Sort by</label>
          <div className="flex items-center space-x-1 relative">
            <Select
              value={sort}
              onValueChange={(value) => onSortChange(value || 'createdAt:desc')}
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
                onClick={() => onSortChange('createdAt:desc')}
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
            />
            {role && (
              <Button
                variant="default"
                size="icon"
                className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                onClick={() => onRoleChange('')}
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
            />
            {industry && (
              <Button
                variant="default"
                size="icon"
                className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                onClick={() => onIndustryChange('')}
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
            />
            {company && (
              <Button
                variant="default"
                size="icon"
                className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                onClick={() => onCompanyChange('')}
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
            />
            {location && (
              <Button
                variant="default"
                size="icon"
                className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2 bg-red-500 rounded-full"
                onClick={() => onLocationChange('')}
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
            onClick={onClearFilters}
            className="text-sm text-white bg-red-500 w-24"
          >
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
} 