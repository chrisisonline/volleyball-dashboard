import { on } from 'svelte/events'
import { createSubscriber } from 'svelte/reactivity'

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

export class Fullscreen {
  readonly isSupported = Boolean(
    doc().fullscreenEnabled ?? doc().webkitFullscreenEnabled
  )

  #subscribe = createSubscriber((update) => {
    const offStandard = on(document, 'fullscreenchange', update)
    const offWebkit = on(document, 'webkitfullscreenchange', update)
    return () => {
      offStandard()
      offWebkit()
    }
  })

  get isFullscreen() {
    this.#subscribe()
    return currentElement() !== null
  }

  toggle = async () => {
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
  }
}
