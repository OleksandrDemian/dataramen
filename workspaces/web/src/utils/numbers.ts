export const gt = (value: number | undefined, target: number): value is number => {
  return value != null && value > target;
};

export const lt = (value: number | undefined, target: number): value is number => {
  return value != null && value < target;
};
