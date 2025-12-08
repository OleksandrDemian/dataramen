export const SERVER_CHECK_INTERVAL = 1000;
export const SERVER_CHECK_TIMEOUT = 30_000;

export const checkServerStatus = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(5_000),
    });

    return res.status === 200;
  } catch (e) {
    return false;
  }
};

export const waitServerAvailability = async (url: string, timeoutMs: number, intervalMs: number): Promise<boolean> => {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const isAvailable = await checkServerStatus(url);
    if (isAvailable) {
      return true;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }

  return false;
};
