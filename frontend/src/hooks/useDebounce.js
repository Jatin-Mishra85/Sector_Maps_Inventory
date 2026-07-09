import { useEffect, useState } from 'react';

/**
 * Returns a debounced copy of `value` that only updates
 * after `delay` milliseconds have passed without `value` changing.
 * Used by search and any other input that should not trigger
 * an API call on every keystroke.
 */
export function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}