import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";
import {Tables, TIMESTAMP_COLUMN_TYPE} from "./utils/migrationUtils";

export class WorkbenchTabs1760816916693 implements MigrationInterface {
  name = "WorkbenchTabs1760816916693";

  public async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: Tables.WorkbenchTabs,
        columns: [
          { name: "id",         type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "createdAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "name",       type: "varchar" },
          { name: "archived",   type: "boolean", isNullable: false, default: false },
          { name: "teamId",     type: "uuid", isNullable: false },
          { name: "queryId",    type: "uuid", isNullable: true },
          { name: "userId",     type: "uuid", isNullable: false },
          { name: "opts",       type: "json", default: "'{}'" },
        ],
      }),
    );

    await queryRunner.createForeignKeys(Tables.WorkbenchTabs, [
      new TableForeignKey({
        columnNames: ["teamId"],
        referencedTableName: Tables.Teams,
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: Tables.Users,
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["queryId"],
        referencedTableName: Tables.Query,
        referencedColumnNames: ["id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys(Tables.WorkbenchTabs, [
      new TableForeignKey({
        columnNames: ["teamId"],
        referencedTableName: Tables.Teams,
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: Tables.Users,
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["queryId"],
        referencedTableName: Tables.Query,
        referencedColumnNames: ["id"],
      }),
    ]);
    await queryRunner.dropTable(Tables.WorkbenchTabs, true);
  }
}
