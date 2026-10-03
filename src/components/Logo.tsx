import { useId } from "react";

/** Brand mark: a coat hanger whose hook is an infinity loop. Same artwork as public/favicon.svg. */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  const id = `cnc-g${useId().replace(/:/g, "")}`;
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff3d7f" />
          <stop offset="1" stopColor="#7b2ff7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={`url(#${id})`} />
      <path className="logo-loop" d="M32 17C28 10.5 17.5 10.5 17.5 17S28 23.5 32 17 46.5 10.5 46.5 17 36 23.5 32 17Z" fill="none" stroke="#fff8e7" strokeWidth="3.4" strokeLinejoin="round" />
      <path d="M32 17v13L9.8 45.4c-1.7 1.2-.9 3.8 1.2 3.8h42c2.1 0 2.9-2.6 1.2-3.8L32 30" fill="none" stroke="#fff8e7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
