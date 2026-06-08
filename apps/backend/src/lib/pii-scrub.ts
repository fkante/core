const REDACTION = '[removed]'

const EMAIL_PATTERN = /\S+@\S+\.\S+/g
const PHONE_PATTERN = /\+?\d[\d\s\-()]{7,}/g
const URL_PATTERN = /https?:\/\/\S+/g

/**
 * Removes personally-identifying contact details from a free-text story before
 * it is published as a public component quote.
 *
 * Three patterns are redacted, in order, so that a URL containing digits is
 * removed whole before the phone pattern can match its inner digit run:
 * 1. URLs (`https?://...`)
 * 2. email addresses (`\S+@\S+\.\S+`)
 * 3. phone-like digit runs (`\+?\d[\d\s\-()]{7,}`)
 */
export function scrubPii(text: string): string {
  return text
    .replace(URL_PATTERN, REDACTION)
    .replace(EMAIL_PATTERN, REDACTION)
    .replace(PHONE_PATTERN, REDACTION)
}
