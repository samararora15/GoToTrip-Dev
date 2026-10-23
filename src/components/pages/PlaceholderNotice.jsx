export function PlaceholderNotice({ phase, note }) {
  return (
    <p className="mt-8 max-w-xl rounded-md border border-border bg-surface px-4 py-3 text-sm text-muted">
      {note ?? `Full functionality ships in ${phase}. This route is wired for navigation testing.`}
    </p>
  )
}
