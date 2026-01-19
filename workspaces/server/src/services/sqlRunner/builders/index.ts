import {createTypeormSelectBuilder} from "./selectBuilder.typeorm";
import {createTypeormUpdateBuilder} from "./updateBuilder.typeorm";
import {IInsertQueryBuilder, ISelectQueryBuilder, IUpdateQueryBuilder} from "./types";
import { IDataSource } from "@dataramen/types";
import {createTypeormInsertBuilder} from "./insertBuilder.typeorm";

export type TCreateSelectBuilder = (table: string, dataSource: IDataSource) => ISelectQueryBuilder;
export const createSelectBuilder: TCreateSelectBuilder = createTypeormSelectBuilder;

export type TCreateUpdateBuilder = (table: string, dataSource: IDataSource) => IUpdateQueryBuilder;
export const createUpdateBuilder: TCreateUpdateBuilder = createTypeormUpdateBuilder;

export type TCreateInsertBuilder = (table: string, dataSource: IDataSource) => IInsertQueryBuilder;
export const createInsertBuilder: TCreateInsertBuilder = createTypeormInsertBuilder;
