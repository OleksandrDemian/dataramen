import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from "typeorm";
import {TIMESTAMP_COLUMN_TYPE} from "./utils/migrationUtils";

export class InitialMigration1754425464078 implements MigrationInterface {
  name = "InitialMigration1754425464078";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create "teams"
    await queryRunner.createTable(
      new Table({
        name: "teams",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          { name: "name", type: "varchar", isNullable: false },
          {
            name: "createdAt",
            type: TIMESTAMP_COLUMN_TYPE,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: TIMESTAMP_COLUMN_TYPE,
            default: "CURRENT_TIMESTAMP",
          },
        ],
      }),
    );

    // Create "users"
    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "createdAt",
            type: TIMESTAMP_COLUMN_TYPE,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: TIMESTAMP_COLUMN_TYPE,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "currentTeamId",
            type: "uuid",
            isNullable: true,
          },
        ],
      }),
    );

    // Create "users_to_teams"
    await queryRunner.createTable(
      new Table({
        name: "users_to_teams",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "role",
            type: "varchar",
            isNullable: false,
            default: "'admin'",
          },
          { name: "teamId", type: "uuid", isNullable: true },
          { name: "userId", type: "uuid", isNullable: true },
        ],
      }),
    );

    // Create "user_settings"
    await queryRunner.createTable(
      new Table({
        name: "user_settings",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "uuid",
          },
          {
            name: "createdAt",
            type: TIMESTAMP_COLUMN_TYPE,
            default: "CURRENT_TIMESTAMP",
          },
          {
            name: "updatedAt",
            type: TIMESTAMP_COLUMN_TYPE,
            default: "CURRENT_TIMESTAMP",
          },
          { name: "userId", type: "uuid", isUnique: true },
        ],
      }),
    );

    // Create "data_sources"
    await queryRunner.createTable(
      new Table({
        name: "data_sources",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "dbUrl", type: "varchar" },
          { name: "dbPort", type: "int", isNullable: true },
          { name: "dbUser", type: "varchar" },
          { name: "dbPassword", type: "varchar", isNullable: true },
          { name: "dbPasswordIv", type: "varchar", isNullable: true },
          { name: "dbPasswordTag", type: "varchar", isNullable: true },
          { name: "dbType", type: "varchar" },
          { name: "createdAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "name", type: "varchar" },
          { name: "description", type: "varchar", isNullable: true },
          { name: "dbDatabase", type: "varchar" },
          { name: "dbSchema", type: "varchar", isNullable: true },
          { name: "allowInsert", type: "boolean", default: false },
          { name: "allowUpdate", type: "boolean", default: false },
          { name: "lastInspected", type: TIMESTAMP_COLUMN_TYPE, isNullable: true },
          { name: "status", type: "varchar", isNullable: true },
          { name: "teamId", type: "uuid", isNullable: true },
          { name: "ownerId", type: "uuid", isNullable: true },
        ],
      }),
    );

    // Create "query"
    await queryRunner.createTable(
      new Table({
        name: "query",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "name", type: "varchar" },
          { name: "opts", type: "json", default: "'{}'" },
          { name: "isTrash", type: "boolean", isNullable: true, default: false },
          { name: "createdAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "teamId", type: "uuid", isNullable: true },
          { name: "dataSourceId", type: "uuid", isNullable: true },
        ],
      }),
    );

    // Create "db_inspection"
    await queryRunner.createTable(
      new Table({
        name: "db_inspection",
        columns: [
          { name: "id", type: "uuid", isPrimary: true, isGenerated: true, generationStrategy: "uuid" },
          { name: "tableName", type: "varchar", isNullable: true },
          { name: "columns", type: "json", isNullable: true },
          { name: "createdAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "updatedAt", type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
          { name: "datasourceId", type: "uuid", isNullable: true },
        ],
      }),
    );

    // Foreign Keys
    await queryRunner.createForeignKey(
      "users",
      new TableForeignKey({
        columnNames: ["currentTeamId"],
        referencedTableName: "users_to_teams",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.createForeignKeys("users_to_teams", [
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
    ]);

    await queryRunner.createForeignKey(
      "user_settings",
      new TableForeignKey({
        columnNames: ["userId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    );

    await queryRunner.createForeignKeys("data_sources", [
      new TableForeignKey({
        columnNames: ["teamId"],
        referencedTableName: "teams",
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["ownerId"],
        referencedTableName: "users",
        referencedColumnNames: ["id"],
      }),
    ]);

    await queryRunner.createForeignKeys("query", [
      new TableForeignKey({
        columnNames: ["teamId"],
        referencedTableName: "teams",
        referencedColumnNames: ["id"],
      }),
      new TableForeignKey({
        columnNames: ["dataSourceId"],
        referencedTableName: "data_sources",
        referencedColumnNames: ["id"],
      }),
    ]);

    await queryRunner.createForeignKey(
      "db_inspection",
      new TableForeignKey({
        columnNames: ["datasourceId"],
        referencedTableName: "data_sources",
        referencedColumnNames: ["id"],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("db_inspection", true);
    await queryRunner.dropTable("query", true);
    await queryRunner.dropTable("data_sources", true);
    await queryRunner.dropTable("user_settings", true);
    await queryRunner.dropTable("users_to_teams", true);
    await queryRunner.dropTable("users", true);
    await queryRunner.dropTable("teams", true);
  }
}
