export function lowercase (val: string): string;
export function lowercase (val?: string): string | undefined;
export function lowercase (val?: string): string | undefined {
  if (val === undefined) return undefined;
  return val.toLowerCase();
}
