import { FileProcessRequest } from '@stamina-project/queue';

/**
 * DTO for CSV processing queue messages
 * Extends the base FileProcessRequest with CSV-specific properties
 */
export interface CsvProcessRequestDto extends FileProcessRequest {
  /** Field mapping configuration for CSV columns to contact properties */
  mapping: Record<string, string>;

  /** Optional audience list ID to add processed contacts to */
  audienceListId?: string;
}
