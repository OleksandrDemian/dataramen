export type THook = {
  on: {
    fromTable: string;
    toTable: string;
    fromColumn: string;
    toColumn: string;
  };
  name: string;
  id: string;
};
