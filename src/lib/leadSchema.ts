import { z } from "zod";
import type { Dictionary, Locale } from "@/i18n";

/**
 * Lead form contract.
 *
 * `LeadFormValues` is written out by hand rather than inferred with
 * `z.infer`. This project compiles with `strictNullChecks: false`, and zod's
 * output inference marks every field optional under that setting — which
 * would silently erase the required/optional distinction for every consumer.
 * Declaring the shape explicitly and annotating the schema against it keeps
 * the types honest without turning a compiler flag on across the whole
 * codebase.
 */
export interface LeadFormValues {
  firstName: string;
  lastName: string;
  businessName: string;
  email: string;
  phone: string;
  preferredLanguage: Locale;
  businessLocation: string;
  serviceType: "electricity" | "gas" | "both";
  locationCount: number;
  notes?: string;
  consent: true;
}

/**
 * Builds the validation schema from the active dictionary, so every message
 * is translated and switching language re-derives the resolver. Zod messages
 * are therefore never hardcoded English strings.
 *
 * The third type argument is `unknown` because `locationCount` accepts the
 * string a number input produces and coerces it.
 */
/**
 * A required text field whose "missing", "wrong type" and "empty" cases all
 * produce the same translated message. Without the explicit `required_error`
 * zod falls back to its own untranslated "Required" whenever the key is
 * absent rather than blank — which is what a non-browser caller (or a future
 * server-side reuse of this schema) would hit.
 */
function requiredString(message: string, max: number) {
  return z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(1, message)
    .max(max);
}

export function createLeadSchema(
  t: Dictionary,
): z.ZodType<LeadFormValues, z.ZodTypeDef, unknown> {
  const e = t.form.errors;

  return z.object({
    firstName: requiredString(e.firstNameRequired, 80),
    lastName: requiredString(e.lastNameRequired, 80),
    businessName: requiredString(e.businessNameRequired, 120),
    email: requiredString(e.emailRequired, 160).email(e.emailInvalid),
    phone: requiredString(e.phoneRequired, 25)
      // Deliberately permissive: accepts US and international shapes and
      // rejects only input that could not be a phone number at all.
      .regex(/^[+(]?\d[\d\s().+-]{6,24}$/, e.phoneInvalid),
    preferredLanguage: z.enum(["en", "es"]),
    businessLocation: requiredString(e.businessLocationRequired, 160),
    serviceType: z.enum(["electricity", "gas", "both"], {
      required_error: e.serviceTypeRequired,
      invalid_type_error: e.serviceTypeRequired,
    }),
    locationCount: z.coerce
      .number()
      .int()
      .min(1, e.locationCountMin)
      .max(100, e.locationCountMax),
    notes: z.string().trim().max(2000, e.notesTooLong).optional(),
    consent: z.literal(true, {
      errorMap: () => ({ message: e.consentRequired }),
    }),
  }) as z.ZodType<LeadFormValues, z.ZodTypeDef, unknown>;
}
