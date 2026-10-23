const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
})

export function formatCurrency(amount) {
  if (amount == null || Number.isNaN(Number(amount))) return '—'
  return inr.format(Number(amount))
}

export function formatDate(dateInput, options = {}) {
  if (!dateInput) return '—'
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export function formatBookingNumber(value) {
  if (!value) return '—'
  return String(value)
}
