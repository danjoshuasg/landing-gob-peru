import { expect, test, type Page } from '@playwright/test'

const openLanding = async (page: Page) => {
  await page.goto('/')
  await expect(page.locator('main#main')).toBeAttached()
}

test('all internal anchors resolve and no fictional contact exists', async ({ page }) => {
  await openLanding(page)
  const targets = await page.locator('a[href^="#"]').evaluateAll((links) => links.map((link) => {
    const href = link.getAttribute('href') ?? ''
    const id = href.slice(1)
    return { href, targetCount: id ? document.querySelectorAll(`#${CSS.escape(id)}`).length : 0 }
  }))
  expect(targets.length).toBeGreaterThan(0)
  expect(targets.filter(({ href, targetCount }) => !href || targetCount !== 1)).toEqual([])
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0)
  await expect(page.locator('a[href*="example."]')).toHaveCount(0)
  await expect(page.getByText(/contacto provisional/i)).toHaveCount(0)
})

test('all required editorial sections exist', async ({ page }) => {
  await openLanding(page)
  for (const selector of ['#top', '#problema', '#metodo', '#para-quien', '#plataforma', '#principios', '#cierre', 'footer.site-footer']) {
    await expect(page.locator(selector)).toHaveCount(1)
  }
  await expect(page.locator('main h1')).toHaveCount(1)
  await expect(page.locator('main > section')).toHaveCount(7)
})

test('images expose local modern variants, alt, dimensions and loading policy', async ({ page }) => {
  await openLanding(page)
  await expect(page.locator('picture')).toHaveCount(4)
  const pictures = await page.locator('picture').evaluateAll((nodes) => nodes.map((picture) => {
    const image = picture.querySelector('img')!
    return {
      alt: image.alt,
      width: image.getAttribute('width'),
      height: image.getAttribute('height'),
      loading: image.getAttribute('loading'),
      source: image.getAttribute('src'),
      formats: [...picture.querySelectorAll('source')].map((source) => ({ type: source.type, srcset: source.srcset })),
    }
  }))
  expect(pictures.every((item) => item.alt && item.width && item.height)).toBeTruthy()
  expect(pictures.filter((item) => item.loading === 'eager')).toHaveLength(1)
  expect(pictures.every((item) => item.source?.startsWith('/images/source/'))).toBeTruthy()
  expect(pictures.every((item) => item.formats.some((source) => source.type === 'image/avif' && source.srcset.includes('/images/optimized/')))).toBeTruthy()
  expect(pictures.every((item) => item.formats.some((source) => source.type === 'image/webp' && source.srcset.includes('/images/optimized/')))).toBeTruthy()
})

test('hero and audience illustrations use different sources', async ({ page }) => {
  await openLanding(page)
  const sources = await page.locator('picture img').evaluateAll((images) => images.map((image) => image.getAttribute('src')))
  expect(sources[0]).not.toBe(sources[2])
})

test('fonts are local and loaded', async ({ page }) => {
  await openLanding(page)
  for (const path of ['/fonts/geist-sans.woff2', '/fonts/source-serif-4-latin.woff2']) {
    expect((await page.request.get(path)).ok()).toBeTruthy()
  }
  const fonts = await page.evaluate(async () => {
    await document.fonts.ready
    return {
      body: getComputedStyle(document.body).fontFamily,
      heading: getComputedStyle(document.querySelector('h1')!).fontFamily,
    }
  })
  expect(fonts.body).toContain('Geist Sans')
  expect(fonts.heading).toContain('Source Serif 4')
})

test('cards and diagrams remain semantic HTML or SVG', async ({ page }) => {
  await openLanding(page)
  await expect(page.locator('article')).not.toHaveCount(0)
  await expect(page.locator('svg')).not.toHaveCount(0)
  await expect(page.locator('canvas')).toHaveCount(0)
  const invalidSvg = await page.locator('svg').evaluateAll((svgs) => svgs.filter((svg) => !svg.hasAttribute('viewBox')).length)
  expect(invalidSvg).toBe(0)
})

for (const viewport of [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
]) {
  test(`no horizontal overflow at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await openLanding(page)
    const width = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth }))
    expect(width.scroll).toBeLessThanOrEqual(width.client + 1)
  })
}

test.describe('progressive enhancement', () => {
  test.use({ javaScriptEnabled: false })
  test('essential content remains visible without JavaScript', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1, name: /Organigrama Abierto/i })).toBeVisible()
    const hidden = await page.locator('[data-reveal]').evaluateAll((nodes) => nodes.filter((node) => {
      const style = getComputedStyle(node)
      return style.opacity === '0' || style.visibility === 'hidden'
    }).length)
    expect(hidden).toBe(0)
  })
})

test('mobile menu declares its control relationship', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openLanding(page)
  const toggle = page.getByRole('button', { name: 'Abrir menú' })
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toHaveAttribute('aria-controls', 'mobile-navigation')
  await expect(page.getByRole('navigation', { name: 'Navegación móvil' })).toHaveAttribute('id', 'mobile-navigation')
})

test('Escape closes mobile menu and returns focus', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openLanding(page)
  const toggle = page.getByRole('button', { name: 'Abrir menú' })
  await toggle.click()
  await page.getByRole('navigation', { name: 'Navegación móvil' }).getByRole('link', { name: 'El problema' }).focus()
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
  await expect(page.locator('body')).not.toHaveClass(/menu-open/)
})

test('mobile menu traps focus while open and closed links are not tabbable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openLanding(page)
  const toggle = page.getByRole('button', { name: 'Abrir menú' })
  const panel = page.getByRole('navigation', { name: 'Navegación móvil' })
  await expect(panel.locator('a').first()).toHaveAttribute('tabindex', '-1')
  await toggle.click()
  const lastLink = panel.locator('a').last()
  await lastLink.focus()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeFocused()
})

test('200 percent text scale keeps controls available without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openLanding(page)
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  const state = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  expect(state.scroll).toBeLessThanOrEqual(state.client + 1)
  await expect(page.getByRole('button', { name: 'Abrir menú' })).toBeVisible()
})

test('reduced motion disables meaningful transitions and smooth scroll', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openLanding(page)
  const state = await page.evaluate(() => ({
    scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    transition: getComputedStyle(document.querySelector('[data-reveal]')!).transitionDuration,
  }))
  expect(state.scrollBehavior).toBe('auto')
  expect(parseFloat(state.transition)).toBeLessThanOrEqual(0.01)
})
