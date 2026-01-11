import {createValuesHandler} from "./valuesHandler";

export type TArgs =
  | "mode"
  | "env";

type ParsedArgs = Record<TArgs, string | undefined>;

function parseProcessArgs(argv: string[]): ParsedArgs {
  const result: ParsedArgs = {
    mode: undefined,
    env: undefined,
  };

  for (const arg of argv) {
    if (!arg.startsWith("--")) continue;

    const [key, ...valueParts] = arg.slice(2).split("=");
    if (!key || valueParts.length === 0) continue;

    // Re-join in case value itself contained "="
    let value = valueParts.join("=");

    // Remove surrounding quotes if present
    value = value.replace(/^["'](.+)["']$/, "$1");

    result[key as TArgs] = value;
  }

  return result;
}

export const Args = createValuesHandler<TArgs>(
  parseProcessArgs(process.argv.slice(2)),
);
