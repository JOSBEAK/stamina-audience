# Usage Guide for @stamina-project/common

This guide provides detailed examples of how to use the common library in your NestJS applications.

## PaginationDto

The `PaginationDto` provides standard pagination parameters with built-in validation and helper methods.

### Properties

- `page?: number` - Page number (1-based, default: 1)
- `limit?: number` - Items per page (default: 10, max: 100)
- `search?: string` - Search term for filtering
- `sort?: string` - Sort field and direction (format: "field:direction", default: "createdAt:desc")

### Helper Methods

- `getOffset()` - Calculate database offset
- `getParsedSort()` - Parse sort parameter into field and direction

### Example Usage

```typescript
import { PaginationDto } from '@stamina-project/common';

@Controller('users')
export class UsersController {
  @Get()
  async findAll(@Query() pagination: PaginationDto) {
    // pagination.page = 1
    // pagination.limit = 10  
    // pagination.search = "john"
    // pagination.sort = "name:asc"
    
    const offset = pagination.getOffset(); // 0 for page 1
    const { sortField, sortDirection } = pagination.getParsedSort();
    // sortField = "name", sortDirection = "ASC"
    
    return this.usersService.findAll(pagination);
  }
}
```

## PaginatedResponseDto

Standardized response format for paginated data with metadata.

### Properties

- `data: T[]` - Array of data items
- `total: number` - Total count across all pages
- `page: number` - Current page number
- `limit: number` - Items per page
- `totalPages: number` - Total number of pages
- `hasNext: boolean` - Whether there's a next page
- `hasPrev: boolean` - Whether there's a previous page

### Example Usage

```typescript
import { PaginatedResponseDto } from '@stamina-project/common';

@Injectable()
export class UsersService {
  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: pagination.getOffset(),
      take: pagination.limit,
    });

    return PaginatedResponseDto.create(users, total, pagination);
  }
}
```

### Response Format

```json
{
  "data": [...],
  "total": 50,
  "page": 2,
  "limit": 10,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": true
}
```

## QueryUtils

Helper class for applying common query operations to TypeORM query builders.

### Methods

#### `applyPagination<T>(queryBuilder, pagination)`

Applies skip/take to query builder for pagination.

```typescript
import { QueryUtils } from '@stamina-project/common';

const queryBuilder = this.repository.createQueryBuilder('user');
QueryUtils.applyPagination(queryBuilder, pagination);
// Adds: .skip(offset).take(limit)
```

#### `applySorting<T>(queryBuilder, pagination, alias, allowedSortFields)`

Applies ORDER BY clause with security validation.

```typescript
const allowedFields = ['name', 'email', 'createdAt'];
QueryUtils.applySorting(queryBuilder, pagination, 'user', allowedFields);
// Adds: .orderBy('user.name', 'ASC')
```

#### `applySearch<T>(queryBuilder, search, searchFields, alias)`

Applies WHERE clause for text search across multiple fields.

```typescript
const searchFields = ['name', 'email'];
QueryUtils.applySearch(queryBuilder, pagination.search, searchFields, 'user');
// Adds: .andWhere('(LOWER(user.name) LIKE :search_0 OR LOWER(user.email) LIKE :search_1)')
```

#### `applyPaginationFeatures<T>(queryBuilder, pagination, alias, searchFields, allowedSortFields)`

Applies all pagination features at once.

```typescript
QueryUtils.applyPaginationFeatures(
  queryBuilder,
  pagination,
  'user',
  ['name', 'email'], // search fields
  ['name', 'email', 'createdAt'] // allowed sort fields
);
```

## Complete Service Example

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  PaginationDto, 
  PaginatedResponseDto, 
  QueryUtils 
} from '@stamina-project/common';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findAll(pagination: PaginationDto): Promise<PaginatedResponseDto<User>> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Apply all pagination features
    QueryUtils.applyPaginationFeatures(
      queryBuilder,
      pagination,
      'user',
      ['name', 'email'], // searchable fields
      ['name', 'email', 'createdAt', 'updatedAt'] // allowed sort fields
    );

    const [users, total] = await queryBuilder.getManyAndCount();
    return PaginatedResponseDto.create(users, total, pagination);
  }

  async findByCompany(
    companyId: string, 
    pagination: PaginationDto
  ): Promise<PaginatedResponseDto<User>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .where('user.companyId = :companyId', { companyId });

    QueryUtils.applyPaginationFeatures(
      queryBuilder,
      pagination,
      'user',
      ['name', 'email'],
      ['name', 'createdAt']
    );

    const [users, total] = await queryBuilder.getManyAndCount();
    return PaginatedResponseDto.create(users, total, pagination);
  }
}
```

## Business-Specific DTOs

For business-specific filtering, extend `PaginationDto`:

```typescript
import { PaginationDto } from '@stamina-project/common';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ContactListParamsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Filter by contact role' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Filter by company' })
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional({ description: 'Filter by location' })
  @IsOptional()
  @IsString()
  location?: string;
}
```

## Best Practices

### Security

- Always use `allowedSortFields` to prevent SQL injection
- Validate search input length and content
- Use parameterized queries (handled automatically by QueryUtils)

### Performance

- Index frequently sorted columns
- Limit search fields to indexed columns when possible
- Consider using database-specific search features for complex searches

### Type Safety

- Always use proper TypeScript types
- Extend DTOs rather than modifying the base classes
- Use the `ObjectLiteral` constraint for TypeORM entities

### API Design

- Use consistent query parameter names across endpoints
- Document all filterable fields in Swagger
- Provide sensible defaults for pagination parameters 