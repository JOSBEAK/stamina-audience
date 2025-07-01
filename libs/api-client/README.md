# API Library

Shared API client functions for the Stamina project.

## Usage

```typescript
import { getContacts, createAudienceList } from '@stamina-project/api';

// Use the API functions in your components or hooks
const contacts = await getContacts({ search: 'john' });
const newList = await createAudienceList({ name: 'My List' });
```

## Organization

- `contacts.ts` - Contact-related API calls
- `audience-lists.ts` - Audience list API calls  
- `uploads.ts` - Upload/file API calls
- `client.ts` - Shared axios client configuration 