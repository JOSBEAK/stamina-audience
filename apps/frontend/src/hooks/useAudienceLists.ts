import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAudienceLists,
  createAudienceList,
  addContactsToAudienceList,
  getAudienceListContacts,
  removeContactsFromAudienceList,
  softDeleteAudienceList,
  getDeletedAudienceLists,
  restoreAudienceList,
} from '@stamina-project/api-client';
import { CreateAudienceListDto } from '@stamina-project/types';

export const useAudienceLists = (
  params: { search?: string; sort?: string } = {}
) => {
  return useQuery({
    queryKey: ['audienceLists', params],
    queryFn: () => getAudienceLists(params),
    select: (data) => data.data,
  });
};

export const useAudienceListContacts = (
  audienceListId: string | undefined,
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
    queryKey: ['audienceLists', audienceListId, 'contacts', params],
    queryFn: () => getAudienceListContacts(audienceListId!, params),
    enabled: options.enabled && !!audienceListId,
  });
};

export const useCreateAudienceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (audienceListData: CreateAudienceListDto) =>
      createAudienceList(audienceListData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audienceLists'] });
    },
  });
};

export const useAddContactsToAudienceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      audienceListId,
      contactIds,
    }: {
      audienceListId: string;
      contactIds: string[];
    }) => addContactsToAudienceList(audienceListId, contactIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['audienceLists', variables.audienceListId],
      });
    },
  });
};

export const useRemoveContactsFromAudienceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      audienceListId,
      contactIds,
    }: {
      audienceListId: string;
      contactIds: string[];
    }) => removeContactsFromAudienceList(audienceListId, contactIds),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['audienceLists', variables.audienceListId, 'contacts'],
      });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useDeletedAudienceLists = (
  params: { page?: number; limit?: number } = {}
) => {
  return useQuery({
    queryKey: ['audienceLists', 'deleted', params],
    queryFn: () => getDeletedAudienceLists(params),
    select: (data) => data.data,
  });
};

export const useSoftDeleteAudienceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: softDeleteAudienceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audienceLists'] });
    },
  });
};

export const useRestoreAudienceList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: restoreAudienceList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audienceLists'] });
    },
  });
};
