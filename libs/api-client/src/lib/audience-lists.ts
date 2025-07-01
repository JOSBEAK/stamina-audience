import { AudienceList, CreateAudienceListDto, Contact } from './types';
import { apiClient } from './client';

// --- Audience List API Functions ---

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
