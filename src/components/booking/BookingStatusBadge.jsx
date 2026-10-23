import { cn } from '@/lib/utils'
import {
  getBookingStatusLabel,
  getBookingStatusStyle,
} from '@/utils/bookingStatus'

export function BookingStatusBadge({ status, className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded border px-2.5 py-0.5 text-xs font-medium',
        getBookingStatusStyle(status),
        className,
      )}
    >
      {getBookingStatusLabel(status)}
    </span>
  )
}
