import { Contact } from './types';

/**
 * Represents a single row of CSV data with dynamic column names
 */
export interface CsvRowData {
  [columnName: string]: string | number | boolean | null | undefined;
}

/**
 * Result of CSV parsing operation
 */
export interface CsvParseResult {
  data: CsvRowData[];
  headers: string[];
  meta: {
    fields?: string[];
    errors: ParseError[];
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}

/**
 * CSV parsing error details
 */
export interface ParseError {
  type: string;
  code: string;
  message: string;
  row?: number;
}

/**
 * Configuration for mapping CSV headers to Contact fields
 */
export interface FieldMappingConfig {
  [csvHeader: string]: string;
}

/**
 * Statistics about CSV import process
 */
export interface CsvImportStats {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  mappedFields: number;
  totalFields: number;
  requiredFieldsMapped: number;
  totalRequiredFields: number;
  allRequiredFieldsMapped: boolean;
}

/**
 * Preview data for field mapping
 */
export interface CsvPreviewData {
  processedData: Partial<Contact>[];
  stats: CsvImportStats;
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
}

/**
 * CSV processing options
 */
export interface CsvProcessingOptions {
  ignoreEmpty: boolean;
  validateRequired: boolean;
  transformData: boolean;
  maxRows?: number;
}
