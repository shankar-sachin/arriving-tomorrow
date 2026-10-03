import type { ReactNode } from "react";

/**
 * Wraps a route. The entrance is a CSS animation, so a new page always renders
 * immediately: nothing waits on the previous page's exit animation to finish.
 */
export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <main className={`page page-enter ${className}`}>{children}</main>;
}

export function Loading({ label = "Unpacking the catalog" }: { label?: string }) {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      {label}…
    </div>
  );
}
