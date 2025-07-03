import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { searchAttributes } from '@stamina-project/api-client';

export const useAttributeSearch = (
  attribute: 'role' | 'company' | 'location' | 'industry',
  initialOptions: { label: string; value: string }[]
) => {
  const [value, setValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] =
    useState<{ label: string; value: string }[]>(initialOptions);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const initialOptionsRef = useRef(initialOptions);

  // Update initial options ref when they change
  useEffect(() => {
    // Only update if the array contents actually changed
    const hasChanged =
      initialOptions.length !== initialOptionsRef.current.length ||
      initialOptions.some(
        (option, index) =>
          option.value !== initialOptionsRef.current[index]?.value ||
          option.label !== initialOptionsRef.current[index]?.label
      );

    if (hasChanged) {
      initialOptionsRef.current = initialOptions;
    }
  }, [initialOptions]);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Reset page and options on new search
    setPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const items = await searchAttributes(
          attribute,
          debouncedSearchTerm,
          5,
          page
        );
        if (isMounted) {
          const newOptions = items.map((item) => ({
            label: item,
            value: item,
          }));

          if (page === 1) {
            setOptions(newOptions);
          } else {
            setOptions((prev) => [...prev, ...newOptions]);
          }

          // If we got less than 5 items, there's no more data
          setHasMore(newOptions.length === 5);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching attribute search results:', error);
        if (isMounted) {
          setIsLoading(false);
          setHasMore(false);
        }
      }
    };

    // Always load data from API for proper pagination
    loadData();

    return () => {
      isMounted = false;
    };
  }, [debouncedSearchTerm, page, attribute]);

  const onLoadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [hasMore, isLoading]);

  const onSearchChange = useCallback((search: string) => {
    setSearchTerm(search);
  }, []);

  const memoizedSetValue = useCallback((newValue: string) => {
    setValue(newValue);
  }, []);

  return useMemo(
    () => ({
      value,
      setValue: memoizedSetValue,
      searchTerm,
      onSearchChange,
      options,
      isLoading,
      hasMore,
      onLoadMore,
    }),
    [
      value,
      memoizedSetValue,
      searchTerm,
      onSearchChange,
      options,
      isLoading,
      hasMore,
      onLoadMore,
    ]
  );
};
