import { SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import { PaginationDto } from '../dto/pagination.dto';

/**
 * Utility functions for working with database queries
 */
export class QueryUtils {
  /**
   * Apply pagination to a TypeORM query builder
   *
   * @param queryBuilder - The TypeORM query builder
   * @param pagination - Pagination parameters
   * @returns The same query builder with pagination applied
   */
  static applyPagination<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: PaginationDto
  ): SelectQueryBuilder<T> {
    return queryBuilder.skip(pagination.getOffset()).take(pagination.limit);
  }

  /**
   * Apply sorting to a TypeORM query builder
   *
   * @param queryBuilder - The TypeORM query builder
   * @param pagination - Pagination parameters (contains sort info)
   * @param alias - The table alias to use for the sort field
   * @param allowedSortFields - Array of allowed sort field names for security
   * @returns The same query builder with sorting applied
   */
  static applySorting<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: PaginationDto,
    alias = '',
    allowedSortFields: string[] = ['createdAt', 'updatedAt', 'id']
  ): SelectQueryBuilder<T> {
    const { sortField, sortDirection } = pagination.getParsedSort();

    // Security: only allow whitelisted sort fields
    if (!allowedSortFields.includes(sortField)) {
      const defaultField = allowedSortFields.includes('createdAt')
        ? 'createdAt'
        : allowedSortFields[0];
      const fieldName = alias ? `${alias}.${defaultField}` : defaultField;
      return queryBuilder.orderBy(fieldName, 'DESC');
    }

    const fieldName = alias ? `${alias}.${sortField}` : sortField;
    return queryBuilder.orderBy(fieldName, sortDirection);
  }

  /**
   * Apply search to a TypeORM query builder
   * Searches across multiple text fields using ILIKE (case-insensitive)
   *
   * @param queryBuilder - The TypeORM query builder
   * @param search - Search term
   * @param searchFields - Array of field names to search in
   * @param alias - The table alias to use for the fields
   * @returns The same query builder with search applied
   */
  static applySearch<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    search: string | undefined,
    searchFields: string[],
    alias = ''
  ): SelectQueryBuilder<T> {
    if (!search || search.trim().length === 0) {
      return queryBuilder;
    }

    const searchTerm = `%${search.trim().toLowerCase()}%`;
    const conditions = searchFields.map((field, index) => {
      const fieldName = alias ? `${alias}.${field}` : field;
      const paramName = `search_${index}`;
      queryBuilder.setParameter(paramName, searchTerm);
      return `LOWER(${fieldName}) LIKE :${paramName}`;
    });

    return queryBuilder.andWhere(`(${conditions.join(' OR ')})`);
  }

  /**
   * Apply all pagination features (pagination, sorting, search) at once
   *
   * @param queryBuilder - The TypeORM query builder
   * @param pagination - Pagination parameters
   * @param alias - The table alias
   * @param searchFields - Fields to search in
   * @param allowedSortFields - Allowed sort fields
   * @returns The same query builder with all pagination features applied
   */
  static applyPaginationFeatures<T extends ObjectLiteral>(
    queryBuilder: SelectQueryBuilder<T>,
    pagination: PaginationDto,
    alias = '',
    searchFields: string[] = [],
    allowedSortFields: string[] = ['createdAt', 'updatedAt', 'id']
  ): SelectQueryBuilder<T> {
    // Apply search first
    if (searchFields.length > 0) {
      this.applySearch(queryBuilder, pagination.search, searchFields, alias);
    }

    // Apply sorting
    this.applySorting(queryBuilder, pagination, alias, allowedSortFields);

    // Apply pagination last
    this.applyPagination(queryBuilder, pagination);

    return queryBuilder;
  }
}

/**
 * Common database constants
 */
export const DB_CONSTANTS = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  DEFAULT_SORT_FIELD: 'createdAt',
  DEFAULT_SORT_DIRECTION: 'DESC' as const,
} as const;
