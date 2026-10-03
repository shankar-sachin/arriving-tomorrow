import { motion } from "framer-motion";
import { isStandalone } from "../components/AchievementToasts";
import { isIos, ShareIcon, useInstallPrompt } from "../components/InstallBanner";
import { Page } from "../components/Page";

const STEPS = {
  iphone: [
    <>Open this site in <b>Safari</b>. Other iPhone browsers can't add it to the home screen on older iOS.</>,
    <>Tap the <ShareIcon /> <b>Share</b> button in the toolbar.</>,
    <>Scroll down and tap <b>Add to Home Screen</b>, then <b>Add</b>.</>,
    <>Open it from your home screen. Full screen, no browser bars, no deliveries.</>,
  ],
  android: [
    <>Open this site in <b>Chrome</b>.</>,
    <>Tap the <b>⋮</b> menu, then <b>Install app</b> (or <b>Add to Home screen</b>).</>,
    <>Confirm with <b>Install</b>. It shows up in your app drawer like a real app.</>,
  ],
  desktop: [
    <>In Chrome or Edge, click the install icon at the right end of the address bar.</>,
    <>In Safari on a Mac, use <b>File → Add to Dock</b>.</>,
  ],
};

export function GetApp() {
  const install = useInstallPrompt();
  const installed = isStandalone();
  const order: Array<keyof typeof STEPS> = isIos() ? ["iphone", "android", "desktop"] : ["android", "iphone", "desktop"];
  const titles = { iphone: "iPhone and iPad", android: "Android", desktop: "Computer" };

  return (
    <Page className="get-app">
      <h1 className="page-title">Get the app <span className="serif">(no App Store required)</span></h1>
      <p className="lede">
        arriving tomorrow installs straight from your browser. No App Store, no account, no download size worth mentioning, and the
        same guaranteed non-delivery.
      </p>
      {installed && <p className="saved-banner">You're already using the app. Look at you.</p>}
      {install && !installed && (
        <button className="btn btn-primary btn-xl" onClick={() => void install()}>Install now</button>
      )}
      <div className="app-steps">
        {order.map((k, i) => (
          <motion.section key={k} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <h2>{titles[k]}</h2>
            <ol>
              {STEPS[k].map((s, j) => (
                <li key={j}>{s}</li>
              ))}
            </ol>
          </motion.section>
        ))}
      </div>
    </Page>
  );
}
