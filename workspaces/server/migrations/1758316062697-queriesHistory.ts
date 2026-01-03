import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm";
import {Tables, TIMESTAMP_COLUMN_TYPE} from "./utils/migrationUtils";

export class QueriesHistory1758316062697 implements MigrationInterface {
  name = "QueriesHistory1758316062697";

  public async up(queryRunner: QueryRunner) {
    // create queryHistory table
    await queryRunner.createTable(
      new Table({
        name: Tables.SavedQueries,
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
    await queryRunner.createForeignKeys(Tables.SavedQueries, [
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

    // update query table with new userId property
    await queryRunner.addColumns(Tables.Query, [
      new TableColumn({
        name: "userId",
        type: "uuid",
        isNullable: true,
      }),
    ]);

    await queryRunner.createForeignKeys(Tables.Query, [
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: Tables.Users,
        referencedColumnNames: ["id"],
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys(Tables.Query, [
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: Tables.Users,
        referencedColumnNames: ["id"],
      }),
    ]);
    await queryRunner.dropColumns(Tables.Query, ["userId"]);
    await queryRunner.dropForeignKeys(Tables.SavedQueries, [
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
    await queryRunner.dropTable("saved_queries", true);
  }
}
