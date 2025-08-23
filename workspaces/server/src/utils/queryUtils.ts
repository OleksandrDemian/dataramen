export function parseOrderQueryParam (orderBy: string | undefined, defaultOrder: Record<string, string> | undefined = undefined): Record<string, string> | undefined {
  try {
    if (orderBy) {
      const parts = orderBy.split("&");
      const order: Record<string, string> = {};

      for (const part of parts) {
        const split = part.split(":");
        order[split[0]] = split[1];
      }
      return order;
    }
  } catch (e) {}

  return defaultOrder;
}
