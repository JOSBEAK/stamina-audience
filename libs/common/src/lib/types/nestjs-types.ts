import { ModuleMetadata, Type } from '@nestjs/common';

/**
 * Generic factory function type for NestJS modules
 */
export type ConfigFactory<T> = (...args: unknown[]) => Promise<T> | T;

/**
 * NestJS dependency injection token types
 */
export type InjectionToken = string | symbol | Type<unknown>;

/**
 * Standard NestJS module async options
 */
export interface ModuleAsyncOptions<T> extends Pick<ModuleMetadata, 'imports'> {
  useFactory: ConfigFactory<T>;
  inject?: InjectionToken[];
}

/**
 * Generic dynamic module configuration
 */
export interface DynamicModuleConfig<T> {
  useFactory: ConfigFactory<T>;
  inject?: InjectionToken[];
  imports?: ModuleMetadata['imports'];
}

/**
 * Standard error handling context
 */
export interface ErrorContext {
  correlationId?: string;
  userId?: string;
  operation?: string;
  metadata?: Record<string, unknown>;
}

/**
 * API Error interface for consistent error handling
 */
export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  context?: ErrorContext;
}

/**
 * Validation error with field-specific information
 */
export interface ValidationError extends ApiError {
  field?: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

/**
 * Generic service response wrapper
 */
export interface ServiceResponse<T> {
  data: T;
  success: boolean;
  error?: ApiError;
  metadata?: Record<string, unknown>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
