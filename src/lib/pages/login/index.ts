import { z } from "zod";

const internalReturnToSchema = z
  .string()
  .refine((value) => value.startsWith("/") && !value.startsWith("//"))
  .transform((value) => {
    const parsed = new URL(value, "http://internal.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  })
  .catch(undefined);

const loginSearchParamsSchema = z
  .object({
    next: z.union([z.string(), z.array(z.string())]).optional(),
  })
  .passthrough()
  .transform(({ next }) => ({
    returnTo: internalReturnToSchema.parse(
      Array.isArray(next) ? next[0] : next,
    ),
  }));

export type LoginSearchParams = z.input<typeof loginSearchParamsSchema>;

export function parseLoginSearchParams(searchParams?: LoginSearchParams) {
  return loginSearchParamsSchema.parse(searchParams ?? {});
}

export function sanitizeLoginReturnTo(value?: string) {
  return internalReturnToSchema.parse(value);
}
