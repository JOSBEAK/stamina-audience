import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSegments,
  createSegment,
  addContactsToSegment,
  getSegmentContacts,
  removeContactsFromSegment,
  softDeleteSegment,
  getDeletedSegments,
  restoreSegment,
} from '../utils/api';
import { CreateSegmentDto } from '@stamina-project/types';

export const useSegments = (
  params: { search?: string; sort?: string } = {}
) => {
  return useQuery({
    queryKey: ['segments', params],
    queryFn: () => getSegments(params),
  });
};

export const useSegmentContacts = (
  segmentId: string | undefined,
  params: {
    page: number;
    limit: number;
    search?: string;
    sort?: string;
    role?: string;
    company?: string;
    location?: string;
    industry?: string;
  },
  options: { enabled: boolean }
) => {
  return useQuery({
    queryKey: ['segments', segmentId, 'contacts', params],
    queryFn: () => getSegmentContacts(segmentId!, params),
    enabled: options.enabled && !!segmentId,
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

export const useRemoveContactsFromSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      segmentId,
      contactIds,
    }: {
      segmentId: string;
      contactIds: string[];
    }) => removeContactsFromSegment(segmentId, contactIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['segments', variables.segmentId, 'contacts'],
      });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useDeletedSegments = () => {
  return useQuery({
    queryKey: ['segments', 'deleted'],
    queryFn: getDeletedSegments,
  });
};

export const useSoftDeleteSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: softDeleteSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};

export const useRestoreSegment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreSegment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['segments'] });
    },
  });
};
