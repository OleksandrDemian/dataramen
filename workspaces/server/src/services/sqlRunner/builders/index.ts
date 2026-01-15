import {createTypeormSelectBuilder} from "./selectBuilder.typeorm";
import {createTypeormUpdateBuilder} from "./updateBuilder.typeorm";
import {ISelectQueryBuilder, IUpdateQueryBuilder} from "./types";
import { IDataSource } from "@dataramen/types";

export type TCreateSelectBuilder = (table: string, dataSource: IDataSource) => ISelectQueryBuilder;
export const createSelectBuilder: TCreateSelectBuilder = createTypeormSelectBuilder;

export type TUpdateSelectBuilder = (table: string, dataSource: IDataSource) => IUpdateQueryBuilder;
export const createUpdateBuilder: TUpdateSelectBuilder = createTypeormUpdateBuilder;
