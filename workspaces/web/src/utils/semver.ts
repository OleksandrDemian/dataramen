const parse = (version: string) => {
  const [main] = version.split('-'); // Ignore pre-release and build metadata
  return main.split('.').map(Number);
};

export const compareSemver = (a: string, b: string): number => {
  const aParts = parse(a);
  const bParts = parse(b);

  for (let i = 0; i < 3; i++) {
    const aNum = aParts[i] || 0;
    const bNum = bParts[i] || 0;

    if (aNum > bNum) return 1;
    if (aNum < bNum) return -1;
  }

  return 0;
}
