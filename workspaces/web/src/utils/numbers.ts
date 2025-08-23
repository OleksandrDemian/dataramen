export const gte = (value: number | undefined, target: number): value is number => {
  return value != null && value > target;
};
