import { FormEvent, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { unlock, useAchievements } from "../lib/achievements";
import { agentFor, GREETING, QUICK_REPLIES, reply } from "../lib/support";

interface Msg {
  id: number;
  from: "me" | "agent" | "system";
  text: string;
}

let nextId = 1;

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([{ id: 0, from: "agent", text: GREETING }]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [escalations, setEscalations] = useState(0);
  const turn = useRef(0);
  const timers = useRef<number[]>([]);
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const countMessage = useAchievements((s) => s.countSupportMessage);
  const agent = agentFor(escalations);
  // Product pages have a sticky buy bar on phones; sit above it.
  const raised = useLocation().pathname.startsWith("/item/");

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (!open) return;
    input.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const send = (text: string) => {
    const clean = text.trim().slice(0, 500);
    if (!clean || typing) return;
    setMsgs((m) => [...m, { id: nextId++, from: "me", text: clean }]);
    setDraft("");
    countMessage();
    const r = reply(clean, turn.current++);
    setTyping(true);
    // Brenda types at a believable, slightly passive-aggressive speed.
    later(() => {
      setTyping(false);
      setMsgs((m) => [...m, { id: nextId++, from: "agent", text: r.text }]);
      if (r.intent === "manager") {
        unlock("manager");
        later(() => {
          setEscalations((n) => n + 1);
          setMsgs((m) => [...m, { id: nextId++, from: "system", text: `${agentFor(escalations + 1).name} joined the chat` }]);
        }, 900);
      }
    }, Math.min(2600, 700 + r.text.length * 18));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    send(draft);
  };

  return (
    <>
      <motion.button
        className={`support-fab ${open ? "open" : ""} ${raised ? "raised" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="support-panel"
        aria-label={open ? "Close customer support" : "Open customer support"}
        whileTap={{ scale: 0.9 }}
      >
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          {open ? (
            <path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          ) : (
            <path d="M4 5h16v11H9l-5 4zM8 9.5h8M8 12.5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          )}
        </svg>
        {!open && <span className="support-fab-label">Help</span>}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="support-panel"
            className="support"
            role="dialog"
            aria-label="Customer support chat"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
          >
            <header className="support-head">
              <span className="support-avatar" aria-hidden="true">{agent.name[0]}</span>
              <div>
                <strong>{agent.name}</strong>
                <small><span className="live-dot" /> {agent.title}</small>
              </div>
            </header>

            <div className="support-log" ref={list} aria-live="polite">
              {msgs.map((m) => (
                <motion.p key={m.id} className={`bubble ${m.from}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  {m.text}
                </motion.p>
              ))}
              {typing && (
                <p className="bubble agent typing" aria-label={`${agent.name} is typing`}>
                  <i /><i /><i />
                </p>
              )}
            </div>

            <div className="support-quick">
              {QUICK_REPLIES.map((q) => (
                <button key={q} type="button" onClick={() => send(q)} disabled={typing}>{q}</button>
              ))}
            </div>

            <form className="support-input" onSubmit={submit}>
              <input
                ref={input}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type your complaint…"
                aria-label="Message customer support"
                maxLength={500}
                enterKeyHint="send"
              />
              <button type="submit" className="btn btn-primary" disabled={!draft.trim() || typing}>Send</button>
            </form>
            <p className="support-fine">Scripted parody support. Nothing you type leaves your browser.</p>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
