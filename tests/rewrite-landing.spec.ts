import { expect, test } from '@playwright/test'

test('brand and one primary hero action identify the platform', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Organigrama Abierto/)
  await expect(page.locator('.site-header .brand')).toContainText('Organigrama Abierto')
  await expect(page.locator('#top')).toContainText('Organigrama Abierto')
  await expect(page.locator('.site-footer')).toContainText('Organigrama Abierto')
  await expect(page.locator('body')).not.toContainText('Gob Perú')
  await expect(page.locator('#top h1')).toContainText(/organigrama|cargos/i)
  await expect(page.locator('#top')).toContainText(/ciudadanos y periodistas/i)
  await expect(page.locator('#top .button-row a')).toHaveCount(1)
  await expect(page.locator('#top .button-row a')).toHaveText(/Conoce la plataforma/)
  await expect(page.locator('#top .button-row a')).toHaveAttribute('href', '#plataforma')
})

test('sections follow the agreed narrative and audiences inherit both images', async ({ page }) => {
  await page.goto('/')
  expect(await page.locator('main > section').evaluateAll((nodes) => nodes.map((node) => node.id))).toEqual([
    'top', 'problema', 'metodo', 'para-quien', 'plataforma', 'principios', 'cierre',
  ])
  await expect(page.locator('main').getByRole('heading', { name: /cómo funciona/i })).toHaveCount(1)
  await expect(page.locator('#para-quien')).toContainText(/ciudadanos/i)
  await expect(page.locator('#para-quien')).toContainText(/periodistas/i)
  await expect(page.locator('#para-quien picture')).toHaveCount(2)
  await expect(page.locator('picture')).toHaveCount(4)
  await expect(page.locator('#plataforma .platform-grid article')).toHaveCount(5)
  for (const nav of ['.desktop-nav', '#mobile-navigation', '.footer-nav']) {
    const links = await page.locator(`${nav} a[href^="#"]`).evaluateAll((nodes) => nodes.map((node) => node.getAttribute('href')!.slice(1)))
    expect(links.length).toBeGreaterThan(0)
    for (const id of links) await expect(page.locator(`[id="${id}"]`)).toHaveCount(1)
    expect(links).not.toContain('vision')
    expect(links).not.toContain('capacidades')
    expect(links).not.toContain('contacto')
  }
})

test('method explains sources, all powers, weekly cut and human validation', async ({ page }) => {
  await page.goto('/')
  const method = page.locator('#metodo')
  for (const term of [
    /fuentes oficiales/i, /validación humana/i, /antes de publicar/i,
    /publicación periódica|publicación semanal/i, /Ejecutivo/i, /direcciones de línea/i,
    /organismos adscritos/i, /alta dirección/i, /Legislativo/i, /mesas directivas/i,
    /parlamentarios/i, /presidentes de comisión/i, /alta dirección administrativa/i,
    /Judicial/i, /Presidencia/i, /jueces supremos/i, /presidentes de cortes superiores/i,
    /gerencia general/i, /organismos constitucionales autónomos/i, /fuera/i,
    /lunes/i, /viernes/i,
  ]) await expect(method).toContainText(term)
})

const withdrawn = [
  'El Estado que aprende, decide mejor.', 'Capacidad pública',
  'La transformación ya ocurre.', 'Datos que se archivan', 'Evidencia que orienta',
  'Del aprendizaje local a una visión compartida.', 'Las mejores respuestas también nacen de escuchar.',
  'Capacidad para cada nivel del servicio público.', 'Una lectura común para problemas conectados.',
  'Hagamos visible el Estado que funciona.', 'Principios antes que promesas.', 'Conversemos',
]

test('mockup language is retired outside the frozen platform', async ({ page }) => {
  await page.goto('/')
  const text = await page.locator('body').innerText()
  for (const phrase of withdrawn) expect(text, `Retirar: ${phrase}`).not.toContain(phrase)
})

test('principles, independence, construction and prohibited material', async ({ page }) => {
  await page.goto('/')
  const principles = page.locator('#principios')
  for (const phrase of [/cada dato.*fuente/i, /neutralidad/i, /enlaza.*no se opina/i, /protección de datos personales/i]) {
    await expect(principles).toContainText(phrase)
  }
  await expect(page.locator('#cierre')).toContainText(/en construcción/i)
  await expect(page.locator('body')).toContainText(/no es un canal oficial/i)
  const content = await page.locator('body').innerText()
  expect(content).not.toMatch(/(?:lanzamiento|estreno)\s+(?:el|en)\s+\d|\b20\d{2}\b|\b(?:Ley|Decreto|Resolución)\s+(?:N[.º°]*\s*)?\d+|\b(?:presidente|presidenta|ministro|ministra|congresista|juez|fiscal)\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+\b|\b\d+(?:%|\s+millones?)\b/iu)
  await expect(page.locator('a[href^="http"], a[href^="mailto:"], a[href*="gob.pe"]')).toHaveCount(0)
  await expect(page.locator('img[src*="escudo"], img[src*="emblema"]')).toHaveCount(0)
})

for (const width of [360, 390, 768, 1024, 1440]) {
  test(`new content fits ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width + 1)
  })
}

test('new text fits 360px at 200 percent', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await page.addStyleTag({ content: 'html { font-size: 200% !important; }' })
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(361)
})

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('fallback presents the same identity, narrative and action', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Organigrama Abierto')
    for (const phrase of [/ciudadanos y periodistas/i, /fuentes oficiales/i, /validación humana/i, /en construcción/i]) {
      await expect(page.locator('main')).toContainText(phrase)
    }
    await expect(page.getByRole('link', { name: 'Conoce la plataforma' })).toHaveAttribute('href', '#plataforma')
    await expect(page.locator('#plataforma')).toHaveCount(1)
  })
})
