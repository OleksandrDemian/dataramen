import {DataSource} from "typeorm";
import {EntitySubscriberInterface, InsertEvent} from "typeorm";
import {v4 as uuid} from "uuid";

function getUuidFieldsMap (dataSource: DataSource): Record<string, string[]> {
  const fields: Record<string, string[]> = {};
  for (const entity of dataSource.entityMetadatas) {
    for (const column of entity.columns) {
      if (column.isPrimary && column.generationStrategy === "uuid") {
        if (!fields[entity.name]) {
          fields[entity.name] = [column.propertyName];
        } else {
          fields[entity.name].push(column.propertyName);
        }
      }
    }
  }
  return fields;
}

function createUuidGeneratorListener (dataSource: DataSource): EntitySubscriberInterface<unknown> {
  const uuidFields = getUuidFieldsMap(dataSource);

  return {
    beforeInsert(event: InsertEvent<unknown>): Promise<any> | void {
      if (uuidFields[event.metadata.name]) {
        for (const prop of uuidFields[event.metadata.name]) {
          // @ts-ignore
          if (!event.entity[prop]) {
            // @ts-ignore
            event.entity[prop] = uuid();
          }
        }
      }
    }
  }
}

export const setupListeners = (dataSource: DataSource) => {
  dataSource.subscribers.push(
    createUuidGeneratorListener(dataSource),
  );
};
