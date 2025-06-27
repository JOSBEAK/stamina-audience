import { MigrationInterface, QueryRunner } from "typeorm";

export class MakeCreatedByInSegmentsNullable1751052032215 implements MigrationInterface {
    name = 'MakeCreatedByInSegmentsNullable1751052032215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_1c7aa23c066b01af74449a644c"`);
        await queryRunner.query(`ALTER TABLE "segment_members" DROP COLUMN "contact_id"`);
        await queryRunner.query(`ALTER TABLE "segment_members" ADD "contact_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "segments" ALTER COLUMN "created_by" DROP NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1c7aa23c066b01af74449a644c" ON "segment_members" ("contact_id", "segment_id") `);
        await queryRunner.query(`ALTER TABLE "segment_members" ADD CONSTRAINT "FK_e5cc2f2e3844335a67afecc4e1f" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "segment_members" DROP CONSTRAINT "FK_e5cc2f2e3844335a67afecc4e1f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1c7aa23c066b01af74449a644c"`);
        await queryRunner.query(`ALTER TABLE "segments" ALTER COLUMN "created_by" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "segment_members" DROP COLUMN "contact_id"`);
        await queryRunner.query(`ALTER TABLE "segment_members" ADD "contact_id" character varying NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1c7aa23c066b01af74449a644c" ON "segment_members" ("contact_id", "segment_id") `);
    }

}
