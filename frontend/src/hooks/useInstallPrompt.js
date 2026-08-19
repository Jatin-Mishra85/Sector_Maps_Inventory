import { useEffect, useState } from "react";

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isInStandaloneMode() {
  return (
    window.navigator.standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState(null);
  const iOS = isIOS();
  const standalone = isInStandaloneMode();

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallEvent(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const promptInstall = async () => {
    if (installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
      return;
    }
    if (iOS) {
      alert(
        'iPhone/iPad par install karne ke liye: Share icon (⬆️) dabao, phir "Add to Home Screen" select karo.',
      );
      return;
    }
    alert(
      "App already installed hai, ya browser install feature support nahi karta.",
    );
  };

  const canInstall = iOS ? !standalone : !!installEvent;

  return { canInstall, promptInstall, isIOS: iOS };
}
