export type TCommand = {
  command: string;
  module?: string;
  description: string;
  handler: (...args: string[]) => Promise<void>;
};

export type TModule = {
  name: string;
  description: string;
  commands: TCommand[];
};
