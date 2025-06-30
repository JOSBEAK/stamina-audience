import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameSegmentToAudienceList1751292397878 implements MigrationInterface {
    name = 'RenameSegmentToAudienceList1751292397878'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."audience_lists_type_enum" AS ENUM('static', 'dynamic')`);
        await queryRunner.query(`CREATE TABLE "audience_lists" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" character varying NOT NULL, "name" character varying NOT NULL, "type" "public"."audience_lists_type_enum" NOT NULL, "rules_json" jsonb, "created_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "search_vector" tsvector, "used_in_count" integer NOT NULL DEFAULT '0', "folder" character varying, CONSTRAINT "PK_b7a292bbfd10a97517eead13843" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3c65d40a391aba3f6b9252f836" ON "audience_lists" ("locationId") `);
        await queryRunner.query(`CREATE TABLE "audience_list_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "locationId" character varying NOT NULL, "audience_list_id" uuid NOT NULL, "contact_id" uuid NOT NULL, "added_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5de29a7a32f22a19ce2a1e137d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ccaa9acf4db5b3a251adedff1e" ON "audience_list_members" ("locationId") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f2d4e70612f5862fbe8d30a39" ON "audience_list_members" ("audience_list_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_31596a85cf84dd47e9f7c7fda9" ON "audience_list_members" ("contact_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2167c6ad1410c9bd34ce0242cb" ON "audience_list_members" ("contact_id", "audience_list_id") `);
        await queryRunner.query(`ALTER TABLE "audience_list_members" ADD CONSTRAINT "FK_31596a85cf84dd47e9f7c7fda9d" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audience_list_members" ADD CONSTRAINT "FK_1f2d4e70612f5862fbe8d30a397" FOREIGN KEY ("audience_list_id") REFERENCES "audience_lists"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "audience_list_members" DROP CONSTRAINT "FK_1f2d4e70612f5862fbe8d30a397"`);
        await queryRunner.query(`ALTER TABLE "audience_list_members" DROP CONSTRAINT "FK_31596a85cf84dd47e9f7c7fda9d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2167c6ad1410c9bd34ce0242cb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_31596a85cf84dd47e9f7c7fda9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f2d4e70612f5862fbe8d30a39"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ccaa9acf4db5b3a251adedff1e"`);
        await queryRunner.query(`DROP TABLE "audience_list_members"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3c65d40a391aba3f6b9252f836"`);
        await queryRunner.query(`DROP TABLE "audience_lists"`);
        await queryRunner.query(`DROP TYPE "public"."audience_lists_type_enum"`);
    }

}
