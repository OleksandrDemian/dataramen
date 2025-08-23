export function reduceStringArrayToBooleanObject (arr: string[]): Record<string, boolean> {
  return arr.reduce((acc, cur) => {
    acc[cur] = true;
    return acc;
  }, {} as Record<string, boolean>);
}
