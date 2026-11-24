export const prerender = true
// Layout depends on orientation and fullscreen support, which only exist in
// the browser. Rendering client-side avoids a server guess that flips on load.
export const ssr = false
