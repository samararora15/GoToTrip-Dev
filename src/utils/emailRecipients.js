/**
 * Confirmation / notification recipient list (Phase 6+).
 * Booker always included; traveler emails added when present; deduped.
 */

function normalizeEmail(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
}

export function buildDedupedRecipientList({ bookerEmail, travelerEmails = [] }) {
  const seen = new Set()
  const recipients = []

  function add(email) {
    const key = normalizeEmail(email)
    if (!key || !key.includes('@') || seen.has(key)) return
    seen.add(key)
    recipients.push(email.trim())
  }

  add(bookerEmail)
  for (const email of travelerEmails) {
    add(email)
  }

  return recipients
}
