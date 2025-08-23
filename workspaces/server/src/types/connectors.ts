export type TReferencesInspection = {
  [startTable: string]: {
    [fieldName: string]: {
      refTable: string;
      refField: string;
    }
  }
};
