import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm";
import {Tables, TIMESTAMP_COLUMN_TYPE, UUIDColumn, UUIDColumnRef} from "./utils/migrationUtils";

const dataSourceFk = new TableForeignKey({
  columnNames: ["dataSourceId"],
  referencedTableName: Tables.DataSources,
  referencedColumnNames: ["id"],
});

const tableFk = new TableForeignKey({
  columnNames: ["tableId"],
  referencedTableName: Tables.DatabaseTable,
  referencedColumnNames: ["id"],
});

export class RefactorInspectionSchema1769858483453 implements MigrationInterface {
  name = "RefactorInspectionSchema1769858483453";

  public async up(queryRunner: QueryRunner) {
    /**
     * Tables.DatabaseTable
     */
    await queryRunner.createTable(new Table({
      name: Tables.DatabaseTable,
      columns: [
        UUIDColumn(),
        { name: "createdAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
        { name: "updatedAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
        { name: "name",       type: "varchar" },
        UUIDColumnRef("dataSourceId", { isNullable: false }),
      ],
    }));

    await queryRunner.createForeignKeys(Tables.DatabaseTable, [
      dataSourceFk
    ]);

    /**
     * Tables.DatabaseColumn
     */
    await queryRunner.createTable(new Table({
      name: Tables.DatabaseColumn,
      columns: [
        UUIDColumn(),
        { name: "createdAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
        { name: "updatedAt",  type: TIMESTAMP_COLUMN_TYPE, default: "CURRENT_TIMESTAMP" },
        { name: "name",       type: "varchar" },
        { name: "type",       type: "varchar" },
        { name: "isPrimary",  type: "boolean" },
        { name: "meta",       type: "json", isNullable: true },
        UUIDColumnRef("tableId", { isNullable: false }),
      ],
    }));

    await queryRunner.createForeignKeys(Tables.DatabaseColumn, [
      tableFk
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    /**
     * Tables.DatabaseColumn
     */
    await queryRunner.dropForeignKeys(Tables.DatabaseColumn, [
      dataSourceFk,
    ]);
    await queryRunner.dropTable(Tables.DatabaseColumn);

    /**
     * Tables.DatabaseTable
     */
    await queryRunner.dropForeignKeys(Tables.DatabaseTable, [
      dataSourceFk,
    ]);
    await queryRunner.dropTable(Tables.DatabaseTable);
  }
}
