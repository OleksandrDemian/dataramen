import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";
import {UUIDColumn, Tables, TIMESTAMP_COLUMN_TYPE, UUIDColumnRef} from "./utils/migrationUtils";

export class WorkbenchTabs1760816916693 implements MigrationInterface {
  name = "WorkbenchTabs1760816916693";

  public async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: Tables.WorkbenchTabs,
        columns: [
          UUIDColumn(),
          { name: "createdAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "name",       type: "varchar" },
          { name: "archived",   type: "boolean", isNullable: false, default: false },
          { name: "opts",       type: "json", isNullable: false },
          UUIDColumnRef("teamId", { isNullable: false }),
          UUIDColumnRef("queryId", { isNullable: true }),
          UUIDColumnRef("userId", { isNullable: false }),
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
