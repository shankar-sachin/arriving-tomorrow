const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const money = (n: number) => usd.format(n);
export const compact = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
export const titleCase = (s: string) => s.replace(/(^|[-\s])(\w)/g, (_, sep, c) => (sep === "-" ? " " : sep) + c.toUpperCase());
