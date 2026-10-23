/** Shared left-aligned page container for public and app pages. */
export function PageShell({ children, className = '' }) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 py-10 text-left sm:px-6 sm:py-14 lg:px-8 ${className}`}
    >
      {children}
    </div>
  )
}
