import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";
import {Tables} from "./utils/migrationUtils";

const dataSourceFk = new TableForeignKey({
  columnNames: ["dataSourceId"],
  referencedTableName: "data_sources",
  referencedColumnNames: ["id"],
});

const dataSourceColumn = new TableColumn({
  name: "dataSourceId",
  type: "uuid",
  isNullable: true,
});

const searchColumn = new TableColumn({
  name: "searchString",
  type: "varchar",
  isNullable: true,
});

export class LinkTabToDatasource1762376647080 implements MigrationInterface {
  name = "LinkTabToDatasource1762376647080";

  public async up(queryRunner: QueryRunner) {
    await queryRunner.addColumns(Tables.WorkbenchTabs, [dataSourceColumn, searchColumn]);
    await queryRunner.addColumns(Tables.SavedQueries, [searchColumn]);
    await queryRunner.createForeignKeys(Tables.WorkbenchTabs, [dataSourceFk]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKeys(Tables.WorkbenchTabs, [dataSourceFk]);
    await queryRunner.dropColumns(Tables.WorkbenchTabs, [dataSourceColumn, searchColumn]);
    await queryRunner.dropColumns(Tables.SavedQueries, [searchColumn]);
  }
}
