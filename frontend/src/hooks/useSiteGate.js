import { useCallback, useState } from 'react';

const GATE_KEY = 'site_unlocked';

function readGateState() {
  try {
    return localStorage.getItem(GATE_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Temporary seeding gate. While locked, the site should show only
 * the Admin form (not Home) so data entry happens before anyone
 * — including you — sees the live cards. Persisted in localStorage
 * so it survives refreshes; remove this hook entirely once the
 * real Admin Panel replaces this temporary form.
 */
export function useSiteGate() {
  const [isUnlocked, setIsUnlocked] = useState(readGateState);

  const unlock = useCallback(() => {
    try {
      localStorage.setItem(GATE_KEY, 'true');
    } catch {
      // localStorage unavailable — unlock for this session only.
    }
    setIsUnlocked(true);
  }, []);

  const lock = useCallback(() => {
    try {
      localStorage.setItem(GATE_KEY, 'false');
    } catch {
      // ignore
    }
    setIsUnlocked(false);
  }, []);

  return { isUnlocked, unlock, lock };
}