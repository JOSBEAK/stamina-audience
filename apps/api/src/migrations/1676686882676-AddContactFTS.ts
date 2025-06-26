import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddContactFTS1676686882676 implements MigrationInterface {
  name = 'AddContactFTS1676686882676';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "search_vector" tsvector`
    );
    await queryRunner.query(`
            CREATE OR REPLACE FUNCTION update_contact_search_vector()
            RETURNS TRIGGER AS $$
            BEGIN
              NEW.search_vector := to_tsvector('english',
                coalesce(NEW.name, '') || ' ' ||
                coalesce(NEW.email, '') || ' ' ||
                coalesce(NEW.role, '') || ' ' ||
                coalesce(NEW.company, '') || ' ' ||
                coalesce(NEW.industry, '') || ' ' ||
                coalesce(NEW.location, '')
              );
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS tsvectorupdate ON "contacts"`
    );
    await queryRunner.query(`
            CREATE TRIGGER tsvectorupdate
            BEFORE INSERT OR UPDATE ON "contacts"
            FOR EACH ROW EXECUTE FUNCTION update_contact_search_vector();
        `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS contact_search_vector_idx ON "contacts" USING GIN(search_vector)`
    );
    await queryRunner.query(`
            UPDATE "contacts" SET "search_vector" = to_tsvector('english',
                coalesce(name, '') || ' ' ||
                coalesce(email, '') || ' ' ||
                coalesce(role, '') || ' ' ||
                coalesce(company, '') || ' ' ||
                coalesce(industry, '') || ' ' ||
                coalesce(location, '')
            ) WHERE search_vector IS NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS contact_search_vector_idx`);
    await queryRunner.query(
      `DROP TRIGGER IF EXISTS tsvectorupdate ON "contacts"`
    );
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS update_contact_search_vector`
    );
    await queryRunner.query(
      `ALTER TABLE "contacts" DROP COLUMN "search_vector"`
    );
  }
}
