import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

const score = (page: Page, team: 'home' | 'away') =>
  page.getByTestId(`${team}-score`)

const press = async (locator: Locator, isMobile: boolean) =>
  isMobile ? locator.tap() : locator.click()

async function box(locator: Locator) {
  const b = await locator.boundingBox()
  if (!b) throw new Error('element has no bounding box')
  return b
}

async function expectInViewport(page: Page, locator: Locator) {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  const b = await box(locator)
  expect(b.x).toBeGreaterThanOrEqual(-1)
  expect(b.y).toBeGreaterThanOrEqual(-1)
  expect(b.x + b.width).toBeLessThanOrEqual(viewport.width + 1)
  expect(b.y + b.height).toBeLessThanOrEqual(viewport.height + 1)
}

async function expectNoOverlap(a: Locator, b: Locator) {
  const [p, q] = await Promise.all([box(a), box(b)])
  const overlaps =
    p.x < q.x + q.width &&
    q.x < p.x + p.width &&
    p.y < q.y + q.height &&
    q.y < p.y + p.height
  expect(overlaps).toBe(false)
}

// The page must never scroll or clip: the board covers exactly the viewport,
// the page can't be scrolled, and every control sits fully on screen without
// covering a score.
async function expectBoardFits(page: Page) {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')

  const scroll = await page.evaluate(() => {
    window.scrollTo(10_000, 10_000)
    const root = document.scrollingElement ?? document.documentElement
    return {
      overflowX: root.scrollWidth - window.innerWidth,
      overflowY: root.scrollHeight - window.innerHeight,
      scrolledX: window.scrollX,
      scrolledY: window.scrollY,
    }
  })
  expect(scroll).toEqual({
    overflowX: expect.any(Number),
    overflowY: expect.any(Number),
    scrolledX: 0,
    scrolledY: 0,
  })
  expect(scroll.overflowX).toBeLessThanOrEqual(0)
  expect(scroll.overflowY).toBeLessThanOrEqual(0)

  const board = await box(page.getByTestId('board'))
  expect(board.x).toBeCloseTo(0, 0)
  expect(board.y).toBeCloseTo(0, 0)
  expect(board.width).toBeCloseTo(viewport.width, 0)
  expect(board.height).toBeCloseTo(viewport.height, 0)

  const controls = await page
    .getByRole('button', { name: /Reset scores|Rotate scoreboard|fullscreen/ })
    .all()
  for (const control of controls) await expectInViewport(page, control)

  for (const team of ['Home', 'Away']) {
    const add = page.getByRole('button', { name: `Add point to ${team}` })
    const subtract = page.getByRole('button', {
      name: `Subtract point from ${team}`,
    })
    await expectInViewport(page, add)
    await expectInViewport(page, subtract)
    await expectNoOverlap(add, subtract)
    for (const control of controls) await expectNoOverlap(add, control)
  }
}

// Side-by-side when Away sits to the right of Home; stacked when below.
async function layoutOf(page: Page) {
  const home = await box(page.getByRole('region', { name: 'Home' }))
  const away = await box(page.getByRole('region', { name: 'Away' }))
  const dx = Math.abs(away.x - home.x)
  const dy = Math.abs(away.y - home.y)
  return dx > dy ? 'side-by-side' : 'stacked'
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  // The board renders client-side only, so once visible it is interactive.
  await expect(page.getByTestId('board')).toBeVisible()
})

test('tapping a score adds a point; −1 subtracts but never below 0', async ({
  page,
  isMobile,
}) => {
  const addHome = page.getByRole('button', { name: 'Add point to Home' })
  const subHome = page.getByRole('button', {
    name: 'Subtract point from Home',
  })

  await press(addHome, isMobile)
  await press(addHome, isMobile)
  await expect(score(page, 'home')).toHaveText('2')
  await expect(score(page, 'away')).toHaveText('0')

  await press(subHome, isMobile)
  await press(subHome, isMobile)
  await press(subHome, isMobile)
  await expect(score(page, 'home')).toHaveText('0')
})

test('reset asks for confirmation, then zeroes both scores', async ({
  page,
  isMobile,
}) => {
  await press(page.getByRole('button', { name: 'Add point to Away' }), isMobile)
  await press(page.getByRole('button', { name: 'Reset scores' }), isMobile)
  await press(page.getByRole('button', { name: 'Cancel' }), isMobile)
  await expect(score(page, 'away')).toHaveText('1')

  await press(page.getByRole('button', { name: 'Reset scores' }), isMobile)
  await press(
    page.getByRole('button', { name: 'Reset', exact: true }),
    isMobile
  )
  await expect(score(page, 'away')).toHaveText('0')
})

test('board fits the screen with nothing cut off or overlapping', async ({
  page,
}) => {
  await expectBoardFits(page)
})

test('layout follows the screen orientation', async ({ page }) => {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  const expected = viewport.height > viewport.width ? 'stacked' : 'side-by-side'
  expect(await layoutOf(page)).toBe(expected)
})

test('rotate button turns the board and it still fits', async ({
  page,
  isMobile,
}) => {
  const before = await layoutOf(page)
  const rotate = page.getByRole('button', { name: 'Rotate scoreboard' })

  await press(rotate, isMobile)
  await expect(rotate).toHaveAttribute('aria-pressed', 'true')
  // Rotated 90°, the board's own layout flips to fit the turned screen, so
  // what the viewport sees keeps the same arrangement axis-for-axis.
  expect(await layoutOf(page)).toBe(before)
  await expect(page.getByTestId('board')).toHaveAttribute(
    'data-layout',
    before === 'stacked' ? 'side-by-side' : 'stacked'
  )
  await expectBoardFits(page)

  await press(page.getByRole('button', { name: 'Add point to Home' }), isMobile)
  await expect(score(page, 'home')).toHaveText('1')

  await press(rotate, isMobile)
  await expect(rotate).toHaveAttribute('aria-pressed', 'false')
})

test('stays contained while celebration bursts are flying', async ({
  page,
  isMobile,
}) => {
  const add = page.getByRole('button', { name: 'Add point to Home' })
  for (let i = 0; i < 5; i++) await press(add, isMobile)
  await expectBoardFits(page)
})

// Odd screen shapes: folded phones, short landscape, split-screen windows.
const EXTREME_VIEWPORTS = [
  { width: 280, height: 480 },
  { width: 320, height: 400 },
  { width: 568, height: 260 },
  { width: 1024, height: 300 },
  { width: 360, height: 1400 },
  { width: 1920, height: 1080 },
]

for (const size of EXTREME_VIEWPORTS) {
  test(`fits a ${size.width}x${size.height} screen, rotated or not`, async ({
    page,
    isMobile,
  }) => {
    await page.setViewportSize(size)
    await expectBoardFits(page)
    await press(
      page.getByRole('button', { name: 'Rotate scoreboard' }),
      isMobile
    )
    await expectBoardFits(page)
  })
}

test('stays contained when the phone turns mid-game', async ({
  page,
  isMobile,
}) => {
  const viewport = page.viewportSize()
  if (!viewport) throw new Error('no viewport')
  await press(page.getByRole('button', { name: 'Add point to Away' }), isMobile)

  await page.setViewportSize({
    width: viewport.height,
    height: viewport.width,
  })
  await expectBoardFits(page)
  await expect(score(page, 'away')).toHaveText('1')
})

test('fullscreen button enters and exits fullscreen', async ({
  page,
  isMobile,
}) => {
  const enter = page.getByRole('button', { name: 'Enter fullscreen' })
  test.skip(!(await enter.isVisible()), 'no Fullscreen API on this browser')

  await press(enter, isMobile)
  const exit = page.getByRole('button', { name: 'Exit fullscreen' })
  await expect(exit).toBeVisible()
  expect(await page.evaluate(() => document.fullscreenElement !== null)).toBe(
    true
  )

  await press(exit, isMobile)
  await expect(enter).toBeVisible()
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull()
})
