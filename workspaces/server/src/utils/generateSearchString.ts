import {
  TQueryOptions,
  TWorkbenchOptions,
} from "@dataramen/types";

export function generateSearchString (opts: Partial<TWorkbenchOptions | TQueryOptions>, ...extra: string[]) {
  const args: string[] = [...extra];

  if (opts.searchAll) {
    args.push(opts.searchAll);
  }

  if (opts.filters) {
    for (const f of opts.filters) {
      if (!f.value) continue;

      args.push(f.value);
    }
  }

  return args.map(v => v.toLowerCase()).join(",");
}
