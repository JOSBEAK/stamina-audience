import { useQuery } from '@tanstack/react-query';
import { searchAttributes } from '@/utils/api';

const prefetchAttributes = ['role', 'industry', 'company', 'location'] as const;

export function usePrefetch() {
  return useQuery({
    queryKey: ['prefetch-attributes'],
    queryFn: async () => {
      const allSettled = await Promise.allSettled(
        prefetchAttributes.map((attribute) =>
          searchAttributes(attribute, '', 5)
        )
      );

      const data = allSettled.reduce((acc, result, index) => {
        const attribute = prefetchAttributes[index];
        if (result.status === 'fulfilled') {
          // Ensure the result is an array and contains only strings
          const value = Array.isArray(result.value)
            ? result.value
                .filter((item) => typeof item === 'string')
                .slice(0, 5)
            : [];
          acc[attribute] = value;
        } else {
          console.warn(
            `Failed to fetch ${attribute} attributes:`,
            result.reason
          );
          acc[attribute] = [];
        }
        return acc;
      }, {} as Record<(typeof prefetchAttributes)[number], string[]>);
      return data;
    },
    staleTime: Infinity,
    enabled: true,
  });
}
