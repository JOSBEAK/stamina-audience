import { Contact } from '@stamina-project/types';

const API_BASE_URL = '/api';

// A generic fetch wrapper
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const { headers, ...restOptions } = options;

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    ...restOptions,
  });

  if (!response.ok) {
    // In a real app, you'd have more robust error handling
    const errorBody = await response.text();
    throw new Error(
      `API Error: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  // Handle cases where the response body might be empty (e.g., 204 No Content)
  const responseText = await response.text();
  try {
    return JSON.parse(responseText);
  } catch (e) {
    return responseText; // Return text if it's not valid JSON
  }
};

interface GetContactsParams {
  search?: string;
  role?: boolean;
  company?: boolean;
  industry?: boolean;
  page?: number;
  limit?: number;
}

export interface ContactsResponse {
  data: Contact[];
  total: number;
}

// --- Contact API Functions ---

export const getContacts = (
  params: GetContactsParams = {}
): Promise<ContactsResponse> => {
  const searchParams = new URLSearchParams();
  if (params.search) {
    searchParams.append('search', params.search);
  }
  if (params.role) {
    searchParams.append('role', 'true');
  }
  if (params.company) {
    searchParams.append('company', 'true');
  }
  if (params.industry) {
    searchParams.append('industry', 'true');
  }
  if (params.page) {
    searchParams.append('page', String(params.page));
  }
  if (params.limit) {
    searchParams.append('limit', String(params.limit));
  }

  const queryString = searchParams.toString();
  return apiFetch(queryString ? `/contacts?${queryString}` : '/contacts');
};

export const addContact = (contactData: Partial<Contact>): Promise<Contact> => {
  return apiFetch('/contacts', {
    method: 'POST',
    body: JSON.stringify(contactData),
  });
};

export const addContactsBatch = (
  contactsData: Partial<Contact>[]
): Promise<Contact[]> => {
  return apiFetch('/contacts/batch', {
    method: 'POST',
    body: JSON.stringify(contactsData),
  });
};
