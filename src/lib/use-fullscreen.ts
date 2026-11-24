import { useCallback, useEffect, useState } from 'react'

// iPhone Safari has no element fullscreen at all; older iPad Safari only has
// the webkit-prefixed API.
type WebkitDocument = Document & {
  webkitFullscreenEnabled?: boolean
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => Promise<void>
}
type WebkitElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void>
}

const doc = () => document as WebkitDocument

const currentElement = () =>
  doc().fullscreenElement ?? doc().webkitFullscreenElement ?? null

export function useFullscreen() {
  const [isSupported, setIsSupported] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setIsSupported(
      Boolean(doc().fullscreenEnabled ?? doc().webkitFullscreenEnabled)
    )
    const sync = () => setIsFullscreen(currentElement() !== null)
    document.addEventListener('fullscreenchange', sync)
    document.addEventListener('webkitfullscreenchange', sync)
    return () => {
      document.removeEventListener('fullscreenchange', sync)
      document.removeEventListener('webkitfullscreenchange', sync)
    }
  }, [])

  const toggle = useCallback(async () => {
    const el = document.documentElement as WebkitElement
    try {
      if (currentElement()) {
        await (document.exitFullscreen ?? doc().webkitExitFullscreen)?.call(
          document
        )
      } else {
        await (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el)
      }
    } catch {
      // Denied (e.g. not triggered by a user gesture); state stays in sync
      // via the change events.
    }
  }, [])

  return { isSupported, isFullscreen, toggle }
}
