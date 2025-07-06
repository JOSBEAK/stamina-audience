// Simple API handler for Vercel deployment
interface Request {
  method?: string;
  url?: string;
  query: Record<string, any>;
  body: any;
}

interface Response {
  status: (code: number) => Response;
  json: (data: any) => Response;
  setHeader: (name: string, value: string) => void;
  end: () => Response;
}

// Mock data for demonstration
const mockContacts = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Software Engineer',
    location: 'San Francisco, CA',
    company: 'Tech Corp',
    industry: 'Technology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Product Manager',
    location: 'New York, NY',
    company: 'Innovation Inc',
    industry: 'Technology',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    role: 'Marketing Director',
    location: 'Los Angeles, CA',
    company: 'Marketing Pro',
    industry: 'Marketing',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockAudienceLists = [
  {
    id: '1',
    name: 'Tech Professionals',
    type: 'dynamic',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 150,
  },
  {
    id: '2',
    name: 'West Coast Contacts',
    type: 'static',
    createdBy: 'admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    memberCount: 87,
  },
];

export default async function handler(req: Request, res: Response) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url, method } = req;

  try {
    // Contacts endpoints
    if (url?.includes('/api/contacts')) {
      if (method === 'GET') {
        const { page = 1, limit = 10, search = '' } = req.query;

        let filteredContacts = mockContacts;
        if (search) {
          filteredContacts = mockContacts.filter(
            (contact) =>
              contact.name
                .toLowerCase()
                .includes(search.toString().toLowerCase()) ||
              contact.email
                .toLowerCase()
                .includes(search.toString().toLowerCase()) ||
              contact.company
                .toLowerCase()
                .includes(search.toString().toLowerCase())
          );
        }

        const startIndex = (Number(page) - 1) * Number(limit);
        const endIndex = startIndex + Number(limit);
        const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

        return res.status(200).json({
          data: paginatedContacts,
          total: filteredContacts.length,
          page: Number(page),
          limit: Number(limit),
        });
      }

      if (method === 'POST') {
        const newContact = {
          id: String(mockContacts.length + 1),
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockContacts.push(newContact);
        return res.status(201).json(newContact);
      }
    }

    // Audience Lists endpoints
    if (url?.includes('/api/audience-lists')) {
      if (method === 'GET') {
        return res.status(200).json({
          data: mockAudienceLists,
          total: mockAudienceLists.length,
        });
      }

      if (method === 'POST') {
        const newList = {
          id: String(mockAudienceLists.length + 1),
          ...req.body,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memberCount: 0,
        };
        mockAudienceLists.push(newList);
        return res.status(201).json(newList);
      }
    }

    // Uploads endpoints
    if (url?.includes('/api/uploads')) {
      if (url?.includes('/presigned-url') && method === 'POST') {
        const { fileName, fileType } = req.body;
        return res.status(200).json({
          presignedUrl: `https://mock-upload-url.com/${fileName}`,
          publicUrl: `https://mock-public-url.com/${fileName}`,
          fileKey: `uploads/${fileName}`,
        });
      }
    }

    // Health check
    if (url?.includes('/api/health')) {
      return res.status(200).json({ status: 'ok', message: 'API is running' });
    }

    // Attribute search endpoints
    if (url?.includes('/api/contacts/attributes/search')) {
      const mockAttributes = {
        role: [
          'Software Engineer',
          'Product Manager',
          'Marketing Director',
          'Sales Representative',
        ],
        company: [
          'Tech Corp',
          'Innovation Inc',
          'Marketing Pro',
          'Sales Force',
        ],
        industry: ['Technology', 'Marketing', 'Sales', 'Finance'],
        location: [
          'San Francisco, CA',
          'New York, NY',
          'Los Angeles, CA',
          'Chicago, IL',
        ],
      };

      const attribute = url.split('/').pop();
      const results =
        mockAttributes[attribute as keyof typeof mockAttributes] || [];
      return res.status(200).json(results);
    }

    // Default response for unknown endpoints
    return res.status(404).json({
      error: 'Not Found',
      message: `Endpoint ${url} not found`,
      availableEndpoints: [
        'GET /api/contacts',
        'POST /api/contacts',
        'GET /api/audience-lists',
        'POST /api/audience-lists',
        'POST /api/uploads/presigned-url',
        'GET /api/health',
      ],
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
