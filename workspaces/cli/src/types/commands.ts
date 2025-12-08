export type TCommand = {
  command: string;
  description: string;
  handler: (...args: string[]) => Promise<void>;
};
