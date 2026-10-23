import { useState } from 'react'
import { getTripImagePublicUrl } from '@/services/storage'
import { sortTripImages } from '@/utils/tripHelpers'
import { cn } from '@/lib/utils'

export function TripGallery({ images = [], title }) {
  const sorted = sortTripImages(images)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!sorted.length) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-md border border-border bg-surface text-muted">
        Photos will be added soon
      </div>
    )
  }

  const active = sorted[activeIndex]
  const activeUrl = getTripImagePublicUrl(active.storage_path)

  return (
    <div className="space-y-3">
      <div className="aspect-[16/10] overflow-hidden rounded-md border border-border bg-surface">
        {activeUrl ? (
          <img
            src={activeUrl}
            alt={active.alt_text || title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>
      {sorted.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {sorted.map((img, index) => {
            const url = getTripImagePublicUrl(img.storage_path)
            return (
              <button
                key={img.id ?? img.storage_path}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-16 w-24 shrink-0 overflow-hidden rounded-md border',
                  index === activeIndex
                    ? 'border-accent'
                    : 'border-border opacity-80 hover:opacity-100',
                )}
              >
                {url ? (
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
