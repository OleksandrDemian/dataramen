import {useEffect, useRef, useState} from 'react';

/**
 * useDebouncedValue
 *
 * @param value The input value to debounce
 * @param delay Delay in milliseconds
 * @param cb
 * @returns The debounced value
 */
export function useDebouncedValue<T>(value: T, delay: number = 500, cb?: (v: T) => void): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const ref = useRef(cb);
  ref.current = cb;

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (ref.current) {
        ref.current(value);
      }
    }, delay);

    // Cleanup if value or delay changes or on unmount
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}
