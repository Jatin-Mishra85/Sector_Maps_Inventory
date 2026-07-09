import { useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';

export function useSearch(initialValue = '', delay = 400) {
  const [term, setTerm] = useState(initialValue);
  const debouncedTerm = useDebounce(term, delay);

  return { term, setTerm, debouncedTerm };
}