import {QueryFilter} from "@dataramen/sql-builder";
import {TFilterParser} from "./types";

type InValue = string | number;

/**
 * Parses an SQL IN(...) expression and returns the values.
 *
 * Examples:
 *  parseInExpression("IN(1, 2, 3)")           -> [1, 2, 3]
 *  parseInExpression("IN('a','b','c')")       -> ["a", "b", "c"]
 *  parseInExpression('IN("a", "b", "c")')     -> ["a", "b", "c"]
 *  parseInExpression("IN(1, 'a', 2, 'b')")    -> [1, "a", 2, "b"]
 */
function parseInExpression(input: string): QueryFilter["value"] {
  if (input === "") return [];

  return tokenizeValues(input).map(parseLiteral);
}

/**
 * Splits "1, 'a', \"b\", 2" into tokens safely.
 */
function tokenizeValues(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  let current = "";

  let inSingle = false;
  let inDouble = false;

  while (i < input.length) {
    const c = input[i];

    // Handle escape inside strings
    if ((inSingle || inDouble) && c === "\\") {
      current += input[i + 1];
      i += 2;
      continue;
    }

    if (c === "'" && !inDouble) {
      inSingle = !inSingle;
      current += c;
      i++;
      continue;
    }

    if (c === '"' && !inSingle) {
      inDouble = !inDouble;
      current += c;
      i++;
      continue;
    }

    // Comma outside strings
    if (c === "," && !inSingle && !inDouble) {
      tokens.push(current.trim());
      current = "";
      i++;
      continue;
    }

    current += c;
    i++;
  }

  if (current.trim() !== "") {
    tokens.push(current.trim());
  }

  if (inSingle || inDouble) {
    throw new Error("Unterminated string literal");
  }

  return tokens;
}

/**
 * Converts a token into a JS value.
 */
function parseLiteral(token: string): { value: InValue } {
  if (token.startsWith("'") && token.endsWith("'")) {
    return { value: unescapeString(token.slice(1, -1), "'") };
  }

  if (token.startsWith('"') && token.endsWith('"')) {
    return { value: unescapeString(token.slice(1, -1), '"') };
  }

  const num = Number(token);
  if (!Number.isNaN(num)) {
    return { value: num };
  }

  throw new Error(`Invalid literal: ${token}`);
}

/**
 * Unescapes \' \" and \\ inside strings.
 */
function unescapeString(value: string, quote: string): string {
  return value.replace(/\\(.)/g, (_, c) => {
    if (c === quote || c === "\\" ) return c;
    return c;
  });
}

export const InParser: TFilterParser = {
  operator: "IN",
  parse: (value) => {
    const match = value.match(/^in\s*\((.*)\)$/i);
    if (!match) return;
    return parseInExpression(match[1]);
  },
  stringify: (f) =>
    `IN (${f.value
      ?.map(v => `"${v.value}"`)
      .join(", ")})`,
};

export const NotInParser: TFilterParser = {
  operator: "NOT IN",
  parse: (value) => {
    const match = value.match(/^not\s+in\s*\((.*)\)$/i);
    if (!match) return;
    return parseInExpression(match[1]);
  },
  stringify: (f) =>
    `NOT IN (${f.value
      ?.map(v => `"${v.value}"`)
      .join(", ")})`
}
