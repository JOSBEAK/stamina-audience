import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrgmIndexOnContacts1676686882677 implements MigrationInterface {
  name = 'AddTrgmIndexOnContacts1676686882677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS contact_name_trgm_idx ON "contacts" USING GIN(name gin_trgm_ops);'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS contact_email_trgm_idx ON "contacts" USING GIN(email gin_trgm_ops);'
    );
    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS contact_company_trgm_idx ON "contacts" USING GIN(company gin_trgm_ops);'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS contact_name_trgm_idx;');
    await queryRunner.query('DROP INDEX IF EXISTS contact_email_trgm_idx;');
    await queryRunner.query('DROP INDEX IF EXISTS contact_company_trgm_idx;');
  }
}
