import { apiClient } from './client';
import type { Contact, GetContactsParams, ContactsResponse } from './types';

// --- Contact API Functions ---

export const getContacts = async (
  params: GetContactsParams = {}
): Promise<ContactsResponse> => {
  const { data } = await apiClient.get('/contacts', { params });
  return data;
};

export const addContact = async (
  contactData: Partial<Contact>
): Promise<Contact> => {
  const { data } = await apiClient.post('/contacts', contactData);
  return data;
};

export const addContactsBatch = async (
  contactsData: Partial<Contact>[]
): Promise<Contact[]> => {
  const { data } = await apiClient.post('/contacts/batch', contactsData);
  return data;
};

export const deleteContacts = async (contactIds: string[]): Promise<void> => {
  await apiClient.delete('/contacts/batch', { data: { ids: contactIds } });
};

export const updateContact = async (
  id: string,
  contactData: Partial<Contact>
): Promise<Contact> => {
  const { data } = await apiClient.patch(`/contacts/${id}`, contactData);
  return data;
};

export const getUniqueLocations = async (): Promise<string[]> => {
  const { data } = await apiClient.get('/contacts/locations');
  return data;
};

export const getUniqueCompanies = async (): Promise<string[]> => {
  const { data } = await apiClient.get('/contacts/companies');
  return data;
};

export const searchAttributes = async (
  attribute: 'company' | 'location' | 'industry' | 'role',
  search: string,
  limit?: number,
  page?: number
): Promise<string[]> => {
  const { data } = await apiClient.get('/contacts/search-attributes', {
    params: { attribute, search, limit, page },
  });
  return data;
};

export const processCsv = async (data: {
  fileKey: string;
  mapping: Record<string, string>;
  audienceListId?: string;
}) => {
  const response = await apiClient.post('/contacts/process-csv', data);
  return response.data;
};

export const createContact = async (
  contactData: Partial<Contact>
): Promise<Contact> => {
  const { data } = await apiClient.post('/contacts', contactData);
  return data;
};
