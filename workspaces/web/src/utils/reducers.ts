export function reduceStringArrayToBooleanObject (arr: string[]): Record<string, boolean> {
  return arr.reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {} as Record<string, boolean>);
}

export function reduceArrayToMap(arr: string[]): Record<string, true | undefined> {
  return arr.reduce<Record<string, true | undefined>>((map, key) => {
    map[key] = true;
    return map;
  }, {});
}
