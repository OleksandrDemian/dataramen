import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "./utils/migrationUtils";

export class QueriesHistory1758316062697 implements MigrationInterface {
  name = "QueriesHistory1758316062697";

  public async up(queryRunner: QueryRunner) {
    // create queryHistory table
    await queryRunner.createTable(
      new Table({
        name: "saved_queries",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "isPersonal", type: "boolean" },
          { name: "createdAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "teamId", type: "uuid", isNullable: true },
          { name: "queryId", type: "uuid", isNullable: false },
          { name: "userId", type: "uuid", isNullable: false },
        ],
      }),
    );

    // queryHistory FKs
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

    // update query table with new userId property
    await queryRunner.addColumns("query", [
      new TableColumn({
        name: "userId",
        type: "uuid",
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys("query", [
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys("query", [
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    ]);
    await queryRunner.dropColumns("query", ["userId"]);
    await queryRunner.dropForeignKeys("saved_queries", [
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
    await queryRunner.dropTable("saved_queries", true);
  }
}
