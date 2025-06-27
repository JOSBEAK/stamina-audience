import { Contact } from '@stamina-project/types';
import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface GetContactsParams {
  search?: string;
  role?: string;
  company?: string;
  location?: string;
  industry?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface ContactsResponse {
  data: Contact[];
  total: number;
}

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
  search: string
): Promise<string[]> => {
  const { data } = await apiClient.get('/contacts/search-attributes', {
    params: { attribute, search },
  });
  return data;
};

// --- Upload API Functions ---

export const getPresignedUrl = async (
  fileName: string,
  fileType: string
): Promise<{ presignedUrl: string; publicUrl: string }> => {
  const { data } = await apiClient.post('/uploads/presigned-url', {
    fileName,
    fileType,
  });
  return data;
};
