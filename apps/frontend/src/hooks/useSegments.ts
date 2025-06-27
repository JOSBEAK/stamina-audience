import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSegments,
  createSegment,
  addContactsToSegment,
  getSegmentContacts,
} from '../utils/api';
import { CreateSegmentDto } from '@stamina-project/types';

export const useSegments = () => {
  return useQuery({
    queryKey: ['segments'],
    queryFn: getSegments,
  });
};

export const useSegmentContacts = (
  segmentId: string,
  params: {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    role?: string;
    company?: string;
    location?: string;
    industry?: string;
  }
) => {
  return useQuery({
    queryKey: ['segments', segmentId, 'contacts', params],
    queryFn: () => getSegmentContacts(segmentId, params),
    enabled: !!segmentId,
  });
};

export const useCreateSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (segmentData: CreateSegmentDto) => createSegment(segmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};

export const useAddContactsToSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      segmentId,
      contactIds,
    }: {
      segmentId: string;
      contactIds: string[];
    }) => addContactsToSegment(segmentId, contactIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['segments', variables.segmentId],
      });
    },
  });
};
