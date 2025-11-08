import {
  TQueryOptions,
  TWorkbenchOptions,
} from "@dataramen/types";

export function generateSearchString (opts: TWorkbenchOptions | TQueryOptions, ...extra: string[]) {
  const args: string[] = [...extra];

  if (opts.searchAll) {
    args.push(opts.searchAll);
  }

  for (const f of opts.filters) {
    if (!f.value) continue;

    for (const v of f.value) {
      if (v.value) {
        args.push(v.value.toString());
      }
    }
  }

  return args.map(v => v.toLowerCase()).join(",");
}
