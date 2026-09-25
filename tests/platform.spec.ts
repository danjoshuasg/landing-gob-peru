import { expect, test, type Page } from '@playwright/test'

const titles = [
  /quién ocupa cada cargo hoy/i,
  /cada dato con su prueba/i,
  /trayectoria de cada funcionario/i,
  /lo que cambió esta semana/i,
  /contexto verificado en un solo lugar/i,
]

const openPlatform = async (page: Page) => {
  await page.goto('/')
  await expect(page.locator('main > section#plataforma')).toHaveCount(1)
}

test('US1: five ordered proposals have diagram, title, promise and description in DOM order', async ({ page }) => {
  await openPlatform(page)
  const cards = page.locator('#plataforma article')
  await expect(cards).toHaveCount(5)
  for (let index = 0; index < titles.length; index++) {
    const card = cards.nth(index)
    await expect(card.locator('h3')).toHaveText(titles[index])
    const content = await card.evaluate((article) => {
      const svg = article.querySelector('svg')
      const heading = article.querySelector('h3')
      const paragraphs = [...article.querySelectorAll('p')].filter((p) => p.textContent?.trim())
      return {
        svg: svg?.namespaceURI === 'http://www.w3.org/2000/svg',
        order: svg && heading && paragraphs.length >= 2 &&
          Boolean(svg.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING) &&
          Boolean(heading.compareDocumentPosition(paragraphs[0]) & Node.DOCUMENT_POSITION_FOLLOWING) &&
          Boolean(paragraphs[0].compareDocumentPosition(paragraphs[1]) & Node.DOCUMENT_POSITION_FOLLOWING),
        promise: paragraphs[0]?.textContent?.trim(),
        description: paragraphs[1]?.textContent?.trim(),
      }
    })
    expect(content.svg).toBe(true)
    expect(content.order).toBe(true)
    expect(content.promise?.length).toBeGreaterThan(15)
    expect(content.description?.length).toBeGreaterThan(25)
  }
})

test('US1: platform follows the merged audience section in main', async ({ page }) => {
  await openPlatform(page)
  await expect(page.locator('main > section#para-quien + section#plataforma')).toHaveCount(1)
})

test('US1: desktop navigation targets the unique platform section and focuses its heading', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await openPlatform(page)
  const link = page.getByRole('navigation', { name: 'Navegación principal' }).getByRole('link', { name: 'Plataforma' })
  await expect(link).toHaveAttribute('href', '#plataforma')
  await expect(page.locator('#plataforma')).toHaveCount(1)
  await link.focus()
  await expect(link).toBeFocused()
  const focus = await link.evaluate((node) => {
    const style = getComputedStyle(node)
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
  })
  expect(focus).toBe(true)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#plataforma$/)
  await expect(page.locator('#plataforma h2').first()).toBeFocused()
  await expect(page.locator('#plataforma h2').first()).toBeInViewport()
})

test('US1: mobile platform link opens, activates by keyboard and closes the menu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openPlatform(page)
  const toggle = page.locator('button.menu-toggle')
  await expect(toggle).toHaveAccessibleName('Abrir menú')
  const panel = page.getByRole('navigation', { name: 'Navegación móvil' })
  const link = panel.getByRole('link', { name: 'Plataforma' })
  await expect(link).toHaveAttribute('href', '#plataforma')
  await expect(link).toHaveAttribute('tabindex', '-1')
  await toggle.click()
  await expect(toggle).toHaveAttribute('aria-expanded', 'true')
  await link.focus()
  await expect(link).toBeFocused()
  expect(await link.evaluate((node) => {
    const style = getComputedStyle(node)
    return style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0
  })).toBe(true)
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/#plataforma$/)
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(page.locator('body')).not.toHaveClass(/menu-open/)
  await expect(link).toHaveAttribute('tabindex', '-1')
  await expect(page.locator('#plataforma h2').first()).toBeFocused()
})

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`US1: platform and document do not overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await openPlatform(page)
    const measures = await page.evaluate(() => {
      const section = document.querySelector('#plataforma')!
      return {
        document: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        section: section.scrollWidth - section.clientWidth,
        right: section.getBoundingClientRect().right - document.documentElement.clientWidth,
      }
    })
    expect(measures.document).toBeLessThanOrEqual(1)
    expect(measures.section).toBeLessThanOrEqual(1)
    expect(measures.right).toBeLessThanOrEqual(1)
  })
}

test('US1: cards remain readable without clipping or overlap at 200% text scale', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await openPlatform(page)
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  await expect(page.locator('#plataforma article')).toHaveCount(5)
  const measures = await page.locator('#plataforma article').evaluateAll((cards) => cards.map((card) => {
    const rect = card.getBoundingClientRect()
    const contents = [card.querySelector('svg'), card.querySelector('h3'), ...card.querySelectorAll('p')]
      .filter((node): node is NonNullable<typeof node> => node !== null)
      .map((node) => node.getBoundingClientRect())
    return {
      cardRight: rect.right,
      contentClipped: contents.some((item) => item.left < rect.left - 1 || item.right > rect.right + 1 || item.bottom > rect.bottom + 1),
      contentOverlaps: contents.some((item, index) => index > 0 && item.top < contents[index - 1].bottom - 1 &&
        item.left < contents[index - 1].right - 1 && item.right > contents[index - 1].left + 1),
      widthOverflow: card.scrollWidth - card.clientWidth,
      heightOverflow: card.scrollHeight - card.clientHeight,
    }
  }))
  for (const card of measures) {
    expect(card.cardRight).toBeLessThanOrEqual(391)
    expect(card.contentClipped).toBe(false)
    expect(card.contentOverlaps).toBe(false)
    expect(card.widthOverflow).toBeLessThanOrEqual(1)
    expect(card.heightOverflow).toBeLessThanOrEqual(1)
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1)
})

test('US2: five decorative inline SVGs use fixed viewBox and no image or external resources', async ({ page }) => {
  await openPlatform(page)
  const cards = page.locator('#plataforma article')
  await expect(cards).toHaveCount(5)
  for (let index = 0; index < 5; index++) {
    const card = cards.nth(index)
    await expect(card.locator('svg')).toHaveCount(1)
    const svg = card.locator('svg')
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(await svg.getAttribute('viewBox')).toMatch(/^0 0 [1-9]\d* [1-9]\d*$/)
    await expect(svg.locator('image, foreignObject, use, animate, animateTransform, set')).toHaveCount(0)
    await expect(svg.locator('[href], [xlink\\:href], [src], [style*="url("]')).toHaveCount(0)
    await expect(card.locator('h3')).toBeVisible()
    expect((await card.locator('p').allTextContents()).filter((text) => text.trim().length > 15).length).toBeGreaterThanOrEqual(2)
  }
})

test('US2: reduced motion prevents animation of every diagram and its descendants', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await openPlatform(page)
  await expect(page.locator('#plataforma article svg')).toHaveCount(5)
  const moving = await page.locator('#plataforma article svg').evaluateAll((svgs) => svgs.flatMap((svg) =>
    [svg, ...svg.querySelectorAll('*')].filter((node) => {
      const style = getComputedStyle(node)
      return style.animationName !== 'none' || parseFloat(style.transitionDuration) > 0.01 ||
        [...node.getAnimations()].some((animation) => animation.playState === 'running')
    }).map((node) => node.tagName),
  ))
  expect(moving).toEqual([])
})

test.describe('US2: static fallback', () => {
  test.use({ javaScriptEnabled: false })
  test('five cards and diagrams remain visible without JavaScript', async ({ page }) => {
    await openPlatform(page)
    const cards = page.locator('#plataforma article')
    await expect(cards).toHaveCount(5)
    for (let index = 0; index < 5; index++) {
      const card = cards.nth(index)
      await expect(card).toBeVisible()
      await expect(card.locator('svg')).toBeVisible()
      await expect(card.locator('h3')).toHaveText(titles[index])
      await expect(card.locator('p')).toHaveCount(2)
    }
  })
})

// FR-008: nombres de funcionarios = cargo seguido de dos nombres propios;
// cifras = dígitos, porcentajes o montos; normas = identificador de ley/decreto/artículo.
// La revisión editorial humana sigue siendo necesaria para nombres sin cargo.
const forbiddenContent = [
  { category: 'nombre de funcionario', pattern: /\b(?:presidente|presidenta|ministro|ministra|congresista|juez|fiscal)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b/u },
  { category: 'cifra', pattern: /\d|\b(?:cien|mil|millones?)\b/iu },
  { category: 'norma específica', pattern: /\b(?:ley|decreto|resoluci[oó]n|art[ií]culo)\s*(?:n[.°ºo]*\s*)?\d+\b/iu },
]

test('FR-007/FR-008: no cross-origin requests and no external links', async ({ page }) => {
  const foreignRequests: string[] = []
  const origin = new URL('http://127.0.0.1:4173').origin
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== origin) foreignRequests.push(request.url())
  })
  await openPlatform(page)
  await page.waitForLoadState('networkidle')
  expect(foreignRequests).toEqual([])
  const links = await page.locator('#plataforma a[href]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')))
  expect(links.filter((href) => href && (!href.startsWith('#') && !href.startsWith('/') || href.startsWith('//')))).toEqual([])
})

test('FR-007/FR-008: future proposal without prohibited content or platform facts', async ({ page }) => {
  await openPlatform(page)
  await expect(page.locator('#plataforma .platform-facts')).toHaveCount(0)
  const text = (await page.locator('#plataforma').innerText()).replace(/\s+/g, ' ')
  for (const { category, pattern } of forbiddenContent) {
    expect.soft(text, `Sin ${category}`).not.toMatch(pattern)
  }
  expect(text).toMatch(/propuesta|en desarrollo|se proyecta|prevista/i)
  expect(text).not.toMatch(/(?:ya|actualmente|ahora)\s+(?:publicamos|actualizamos|ofrecemos)|servicio (?:activo|operativo)/i)
})
