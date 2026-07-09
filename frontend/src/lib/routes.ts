export const HOME = "/";

export function sessionPath(sessionId: number): string {
  return `/${sessionId}`;
}

export function parseSessionId(raw: string | undefined): number | null {
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
}
