export function sanitizeLoginReturnTo(value?: string) {
  if (!value) {
    return undefined;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  try {
    const parsed = new URL(value, "http://internal.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}
