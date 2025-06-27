import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUniqueConstraintToEmail1751013186696 implements MigrationInterface {
    name = 'AddUniqueConstraintToEmail1751013186696'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_d42c1ab08ad3c048776bdda2f9"`);
        await queryRunner.query(`ALTER TABLE "contacts" ADD CONSTRAINT "UQ_752866c5247ddd34fd05559537d" UNIQUE ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "contacts" DROP CONSTRAINT "UQ_752866c5247ddd34fd05559537d"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_d42c1ab08ad3c048776bdda2f9" ON "contacts" ("email", "brand_id", "crm_list_id") `);
    }

}
