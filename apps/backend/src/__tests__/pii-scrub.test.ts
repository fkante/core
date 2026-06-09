import { describe, expect, it } from 'vitest'

import { scrubPii } from '../lib/pii-scrub.js'

describe('scrubPii', () => {
  it('removes email addresses', () => {
    const result = scrubPii('Contact me at rider@example.com for details.')
    expect(result).not.toContain('rider@example.com')
    expect(result).toContain('[removed]')
  })

  it('removes phone-like digit runs', () => {
    const result = scrubPii('Call +1 (555) 123-4567 to follow up.')
    expect(result).not.toMatch(/\d{3}/)
    expect(result).toContain('[removed]')
  })

  it('removes URLs', () => {
    const result = scrubPii('See https://example.com/thread/42 for the photos.')
    expect(result).not.toContain('https://example.com/thread/42')
    expect(result).toContain('[removed]')
  })

  it('removes a URL whole before its inner digits can match the phone pattern', () => {
    const result = scrubPii('Thread at https://forum.test/12345678 has more.')
    expect(result).toBe('Thread at [removed] has more.')
  })

  it('leaves text without PII unchanged', () => {
    const clean = 'The freehub bearing failed after a few rides on rough roads.'
    expect(scrubPii(clean)).toBe(clean)
  })

  it('redacts multiple PII fragments in one story', () => {
    const result = scrubPii('Email rider@example.com or call 555-123-4567 — see https://x.test/y.')
    expect(result).not.toContain('rider@example.com')
    expect(result).not.toContain('555-123-4567')
    expect(result).not.toContain('https://x.test/y')
  })
})
