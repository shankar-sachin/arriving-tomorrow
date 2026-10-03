import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { isStandalone } from "./AchievementToasts";

const DISMISS_KEY = "clothes-never-come-install-dismissed";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const isIos = () =>
  typeof navigator !== "undefined" &&
  (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

/** Safari is the only iOS browser with "Add to Home Screen" for every iOS version we care about. */
export const isIosSafari = () => isIos() && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);

/** Chrome/Edge/Android fire beforeinstallprompt; keep it so a button can trigger the real prompt. */
export function useInstallPrompt() {
  const [evt, setEvt] = useState<InstallPromptEvent | null>(null);
  useEffect(() => {
    const on = (e: Event) => {
      e.preventDefault();
      setEvt(e as InstallPromptEvent);
    };
    const done = () => setEvt(null);
    window.addEventListener("beforeinstallprompt", on);
    window.addEventListener("appinstalled", done);
    return () => {
      window.removeEventListener("beforeinstallprompt", on);
      window.removeEventListener("appinstalled", done);
    };
  }, []);
  return evt
    ? async () => {
        await evt.prompt();
        await evt.userChoice;
        setEvt(null);
      }
    : null;
}

const readDismissed = () => {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
};

/** A home-page nudge on phones until dismissed: the Share-sheet steps on iPhone, the real install prompt elsewhere. */
export function InstallBanner() {
  const install = useInstallPrompt();
  const [dismissed, setDismissed] = useState(readDismissed);
  const [ios] = useState(isIosSafari);
  const home = useLocation().pathname === "/";
  const show = home && !dismissed && !isStandalone() && (ios || install !== null);

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode: it just shows again next visit.
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.aside className="install-banner" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }}>
          <img src={`${import.meta.env.BASE_URL}icons/icon-192.png`} alt="" width={44} height={44} />
          <div>
            <strong>Get the app. It's free, like everything.</strong>
            {ios ? (
              <span>
                Tap <ShareIcon /> Share, then <b>Add to Home Screen</b>.
              </span>
            ) : (
              <span>Install it and never receive anything, faster.</span>
            )}
          </div>
          {!ios && install && (
            <button className="btn btn-primary" onClick={() => void install()}>Install</button>
          )}
          {ios && <Link to="/app" className="link">How?</Link>}
          <button className="install-x" onClick={dismiss} aria-label="Dismiss">×</button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export function ShareIcon() {
  return (
    <svg className="share-icon" viewBox="0 0 24 24" width="18" height="18" aria-label="the Share icon" role="img">
      <path d="M12 3v12M8 7l4-4 4 4M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
