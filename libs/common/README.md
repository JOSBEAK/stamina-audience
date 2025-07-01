# @stamina-project/common

A shared library providing common DTOs, utilities, and patterns for the Stamina Project monorepo.

## Features

- **Pagination DTOs**: Generic pagination, sorting, and search functionality
- **Query Utilities**: TypeORM query builder helpers for common operations
- **Type Safety**: Full TypeScript support with proper type constraints
- **Reusable**: Designed to be used across all apps in the monorepo

## Installation

```typescript
import { PaginationDto, PaginatedResponseDto, QueryUtils } from '@stamina-project/common';
```

## Quick Start

### Basic Pagination

```typescript
import { PaginationDto, PaginatedResponseDto } from '@stamina-project/common';

// In your controller
@Get()
async findAll(@Query() pagination: PaginationDto) {
  const [data, total] = await this.service.findWithPagination(pagination);
  return PaginatedResponseDto.create(data, total, pagination);
}
```