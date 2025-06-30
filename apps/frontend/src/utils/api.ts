import axios from 'axios';
import { Contact, CreateSegmentDto, Segment } from '@stamina-project/types';

const API_URL = import.meta.env.VITE_API_URL;

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

export const getSegments = async (
  params: { search?: string; sort?: string } = {}
): Promise<{ data: Segment[]; total: number }> => {
  const { data } = await apiClient.get('/segments', { params });
  return data;
};

export const createSegment = async (
  segmentData: CreateSegmentDto
): Promise<Segment> => {
  const { data } = await apiClient.post('/segments', segmentData);
  return data;
};

export const getSegmentContacts = async (
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
): Promise<{ data: Contact[]; total: number }> => {
  const { data } = await apiClient.get(`/segments/${segmentId}/contacts`, {
    params,
  });
  return data;
};

export const addContactsToSegment = async (
  segmentId: string,
  contactIds: string[]
): Promise<void> => {
  await apiClient.post(`/segments/${segmentId}/contacts`, { contactIds });
};

export const softDeleteSegment = async (segmentId: string): Promise<void> => {
  await apiClient.delete(`/segments/${segmentId}`);
};

export const getDeletedSegments = async (
  params: { page?: number; limit?: number } = {}
): Promise<{ data: Segment[]; total: number }> => {
  const { data } = await apiClient.get('/segments/deleted', { params });
  return data;
};

export const restoreSegment = async (segmentId: string): Promise<void> => {
  await apiClient.post(`/segments/${segmentId}/restore`);
};

export const removeContactsFromSegment = async (
  segmentId: string,
  contactIds: string[]
): Promise<void> => {
  await apiClient.delete(`/segments/${segmentId}/contacts`, {
    data: { contactIds },
  });
};

export const processCsv = async (data: {
  fileKey: string;
  mapping: Record<string, string>;
  segmentId?: string;
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
