/**
 * Message safe to show a customer. Our own `throw new Error("...")` messages
 * are written for people and pass through; database and library errors are
 * logged for us and replaced with the fallback.
 */
export function publicMessage(e: unknown, fallback: string, tag = "error") {
  const internal =
    !(e instanceof Error) ||
    e.name.startsWith("Prisma") ||
    /invocation|constraint|prisma|ECONN|ETIMEDOUT|fetch failed/i.test(e.message);
  if (internal) {
    console.error(`[${tag}]`, e instanceof Error ? e.message : e);
    return fallback;
  }
  return e.message;
}
