/**
 * Browser translation (e.g. Chrome's Google Translate) and some extensions move or wrap
 * React-managed text nodes. React then throws "Failed to execute 'removeChild'/'insertBefore'
 * on 'Node'" during the next update and unmounts the whole app. This is the standard
 * workaround (facebook/react#11538): skip the operation instead of throwing.
 */
export function installDomGuard() {
  if (typeof Node !== "function" || !Node.prototype) return;

  const removeChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(this: Node, child: T): T {
    if (child.parentNode !== this) {
      console.warn("[arriving tomorrow] skipped removeChild on a node that was moved by the browser or an extension");
      return child;
    }
    return removeChild.call(this, child) as T;
  };

  const insertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(this: Node, node: T, ref: Node | null): T {
    if (ref && ref.parentNode !== this) {
      console.warn("[arriving tomorrow] skipped insertBefore relative to a node that was moved by the browser or an extension");
      return node;
    }
    return insertBefore.call(this, node, ref) as T;
  };
}
