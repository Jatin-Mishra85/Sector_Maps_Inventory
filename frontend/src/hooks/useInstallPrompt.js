import { useEffect, useState } from 'react';

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
    } else {
      alert('App already installed hai, ya browser install feature support nahi karta.');
    }
  };

  return { canInstall: true, promptInstall };
}