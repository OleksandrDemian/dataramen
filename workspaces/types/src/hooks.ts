export interface IHook {
  fromTable: string;
  toTable: string;
  fromColumn: string;
  toColumn: string;
  direction: 'in' | 'out';
  id: string;
}
