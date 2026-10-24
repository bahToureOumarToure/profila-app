import { useEffect, useState } from 'react';

// Renvoie `value` une fois qu'elle n'a plus changé pendant `delay` ms.
export function useDebouncedValue(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
