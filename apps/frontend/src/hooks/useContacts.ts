import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Contact } from '@stamina-project/types';
import {
  getContacts,
  addContactsBatch,
  deleteContacts,
  updateContact,
  getUniqueLocations,
  getUniqueCompanies,
  GetContactsParams,
} from '../utils/api';

export const useContacts = (
  params: GetContactsParams,
  options: { enabled: boolean }
) => {
  return useQuery({
    queryKey: ['contacts', params],
    queryFn: () => getContacts(params),
    enabled: options?.enabled,
  });
};

export const useUniqueLocations = () => {
  return useQuery({
    queryKey: ['uniqueLocations'],
    queryFn: getUniqueLocations,
  });
};

export const useUniqueCompanies = () => {
  return useQuery({
    queryKey: ['uniqueCompanies'],
    queryFn: getUniqueCompanies,
  });
};

export const useAddContactsBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addContactsBatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useDeleteContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};

export const useUpdateContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      contactData,
    }: {
      id: string;
      contactData: Partial<Contact>;
    }) => updateContact(id, contactData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};
