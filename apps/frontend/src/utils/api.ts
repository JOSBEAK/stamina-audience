import axios from 'axios';
import {
  Contact,
  CreateAudienceListDto,
  AudienceList,
} from '@stamina-project/types';

// Use environment variable or fallback to /api (which will be proxied to localhost:3000)
const API_URL = import.meta.env.VITE_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_URL,
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
  search: string,
  limit?: number,
  page?: number
): Promise<string[]> => {
  const { data } = await apiClient.get('/contacts/search-attributes', {
    params: { attribute, search, limit, page },
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

export const getAudienceLists = async (
  params: { search?: string; sort?: string } = {}
): Promise<{ data: AudienceList[]; total: number }> => {
  const { data } = await apiClient.get('/audience-lists', { params });
  return data;
};

export const createAudienceList = async (
  audienceListData: CreateAudienceListDto
): Promise<AudienceList> => {
  const { data } = await apiClient.post('/audience-lists', audienceListData);
  return data;
};

export const getAudienceListContacts = async (
  audienceListId: string,
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
): Promise<{ data: Contact[]; total: number }> => {
  const { data } = await apiClient.get(
    `/audience-lists/${audienceListId}/contacts`,
    {
      params,
    }
  );
  return data;
};

export const addContactsToAudienceList = async (
  audienceListId: string,
  contactIds: string[]
): Promise<void> => {
  await apiClient.post(`/audience-lists/${audienceListId}/contacts`, {
    contactIds,
  });
};

export const softDeleteAudienceList = async (
  audienceListId: string
): Promise<void> => {
  await apiClient.delete(`/audience-lists/${audienceListId}`);
};

export const getDeletedAudienceLists = async (
  params: { page?: number; limit?: number } = {}
): Promise<{ data: AudienceList[]; total: number }> => {
  const { data } = await apiClient.get('/audience-lists/deleted', { params });
  return data;
};

export const restoreAudienceList = async (
  audienceListId: string
): Promise<void> => {
  await apiClient.post(`/audience-lists/${audienceListId}/restore`);
};

export const removeContactsFromAudienceList = async (
  audienceListId: string,
  contactIds: string[]
): Promise<void> => {
  await apiClient.delete(`/audience-lists/${audienceListId}/contacts`, {
    data: { contactIds },
  });
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
