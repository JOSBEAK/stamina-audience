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
        if (result.status === 'fulfilled') {
          acc[prefetchAttributes[index]] = result.value.slice(0, 5);
        } else {
          acc[prefetchAttributes[index]] = [];
        }
        return acc;
      }, {} as Record<(typeof prefetchAttributes)[number], string[]>);
      return data;
    },
    staleTime: Infinity,
    enabled: true,
  });
}
