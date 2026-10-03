import { motion } from "framer-motion";
import { Page } from "../components/Page";
import { ACHIEVEMENTS, useAchievements } from "../lib/achievements";

export function Achievements() {
  const unlocked = useAchievements((s) => s.unlocked);
  const got = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;

  return (
    <Page className="achievements">
      <h1 className="page-title">Achievements <span className="serif">(worthless, like everything here)</span></h1>
      <div className="saved-banner">
        <span>Unlocked</span>
        <strong>{got} / {ACHIEVEMENTS.length}</strong>
        <span>{got === ACHIEVEMENTS.length ? "You've done it all. Nothing has arrived." : "Keep going. Nothing is arriving anyway."}</span>
      </div>
      <ul className="achievement-grid">
        {ACHIEVEMENTS.map((a, i) => {
          const at = unlocked[a.id];
          return (
            <motion.li
              key={a.id}
              className={`achievement ${at ? "got" : "locked"}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <span className="medal" aria-hidden="true">{at ? "★" : "?"}</span>
              <div>
                <strong>{a.title}</strong>
                <span>{a.blurb}</span>
                <small>{at ? `Unlocked ${new Date(at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : "Locked"}</small>
              </div>
            </motion.li>
          );
        })}
      </ul>
    </Page>
  );
}
