import { useState, useMemo } from 'react';
import { useDebounce } from '../shared/useDebounce';
import { usePrefetch } from '../shared/usePrefetch';
import { useAttributeSearch } from '../shared/useAttributeSearch';

export const useContactFilters = () => {
  const { data: prefetchedData } = usePrefetch();

  const roleOptions = useMemo(() => {
    if (prefetchedData?.role && Array.isArray(prefetchedData.role)) {
      return prefetchedData.role.map((item: string) => ({
        label: item,
        value: item,
      }));
    }
    return [];
  }, [prefetchedData?.role]);

  const companyOptions = useMemo(() => {
    if (prefetchedData?.company && Array.isArray(prefetchedData.company)) {
      return prefetchedData.company.map((item: string) => ({
        label: item,
        value: item,
      }));
    }
    return [];
  }, [prefetchedData?.company]);

  const locationOptions = useMemo(() => {
    if (prefetchedData?.location && Array.isArray(prefetchedData.location)) {
      return prefetchedData.location.map((item: string) => ({
        label: item,
        value: item,
      }));
    }
    return [];
  }, [prefetchedData?.location]);

  const industryOptions = useMemo(() => {
    if (prefetchedData?.industry && Array.isArray(prefetchedData.industry)) {
      return prefetchedData.industry.map((item: string) => ({
        label: item,
        value: item,
      }));
    }
    return [];
  }, [prefetchedData?.industry]);

  const roleFilter = useAttributeSearch('role', roleOptions);
  const companyFilter = useAttributeSearch('company', companyOptions);
  const locationFilter = useAttributeSearch('location', locationOptions);
  const industryFilter = useAttributeSearch('industry', industryOptions);

  const [searchQuery, setSearchQuery] = useState('');
  const [sort, setSort] = useState('createdAt:desc');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const listParams = useMemo(
    () => ({
      search: debouncedSearchQuery,
      sort,
      role: roleFilter.value,
      company: companyFilter.value,
      location: locationFilter.value,
      industry: industryFilter.value,
    }),
    [
      debouncedSearchQuery,
      sort,
      roleFilter.value,
      companyFilter.value,
      locationFilter.value,
      industryFilter.value,
    ]
  );

  const areFiltersActive = useMemo(
    () =>
      sort !== 'createdAt:desc' ||
      roleFilter.value !== '' ||
      companyFilter.value !== '' ||
      locationFilter.value !== '' ||
      industryFilter.value !== '' ||
      searchQuery !== '',
    [
      sort,
      roleFilter.value,
      companyFilter.value,
      locationFilter.value,
      industryFilter.value,
      searchQuery,
    ]
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSort('createdAt:desc');
    roleFilter.setValue('');
    roleFilter.onSearchChange('');
    companyFilter.setValue('');
    companyFilter.onSearchChange('');
    locationFilter.setValue('');
    locationFilter.onSearchChange('');
    industryFilter.setValue('');
    industryFilter.onSearchChange('');
  };

  return {
    listParams,
    searchQuery,
    setSearchQuery,
    sort,
    setSort,
    roleFilter,
    companyFilter,
    locationFilter,
    industryFilter,
    areFiltersActive,
    handleClearFilters,
  };
};
