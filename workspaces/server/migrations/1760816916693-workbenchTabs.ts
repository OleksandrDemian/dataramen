import {MigrationInterface, QueryRunner, Table, TableForeignKey} from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "./utils/migrationUtils";

export class WorkbenchTabs1760816916693 implements MigrationInterface {
  name = "WorkbenchTabs1760816916693";

  public async up(queryRunner: QueryRunner) {
    await queryRunner.createTable(
      new Table({
        name: "workbench_tabs",
        columns: [
          { name: "id",         type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "createdAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "name",       type: "varchar" },
          { name: "teamId",     type: "uuid", isNullable: false },
          { name: "queryId",    type: "uuid", isNullable: true },
          { name: "userId",     type: "uuid", isNullable: false },
        ],
      }),
    );

    await queryRunner.createForeignKeys("saved_queries", [
      new TableForeignKey({
        columnNames: ["teamId"],
        referencedTableName: "teams",
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["queryId"],
        referencedTableName: "query",
        referencedColumnNames: ["id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys("workbench_tabs", [
      new TableForeignKey({
        columnNames: ["teamId"],
        referencedTableName: "teams",
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["queryId"],
        referencedTableName: "query",
        referencedColumnNames: ["id"],
      }),
    ]);
    await queryRunner.dropTable("workbench_tabs", true);
  }
}
