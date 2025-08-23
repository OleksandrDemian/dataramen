import { useEffect, useState } from 'react';

/**
 * useDebouncedValue
 *
 * @param value The input value to debounce
 * @param delay Delay in milliseconds
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    // Cleanup if value or delay changes or on unmount
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};
