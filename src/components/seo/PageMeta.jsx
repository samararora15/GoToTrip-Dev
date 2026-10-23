import { useEffect } from 'react'
import { APP_NAME } from '@/utils/constants'

function upsertMeta(attr, key, content) {
  if (!content) return
  const selector =
    attr === 'name'
      ? `meta[name="${key}"]`
      : `meta[property="${key}"]`
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    if (attr === 'name') el.setAttribute('name', key)
    else el.setAttribute('property', key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function PageMeta({
  title,
  description,
  image,
  path = '',
}) {
  useEffect(() => {
    const fullTitle = title ? `${title} · ${APP_NAME}` : APP_NAME
    document.title = fullTitle

    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
    }
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:type', 'website')
    if (image) upsertMeta('property', 'og:image', image)

    const origin = window.location.origin
    const url = `${origin}${path.startsWith('/') ? path : `/${path}`}`
    upsertMeta('property', 'og:url', url)
  }, [title, description, image, path])

  return null
}
