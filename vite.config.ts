import { createServer, defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

function platformFallback(): Plugin {
  return {
    name: 'platform-fallback',
    async transformIndexHtml(html) {
      // Use the same TSX module as the client, with Vite handling SSR transforms in both modes.
      const server = await createServer({
        configFile: false,
        plugins: [react()],
        server: { middlewareMode: true, hmr: false },
        appType: 'custom',
      })
      try {
        const { PlatformSection } = await server.ssrLoadModule('/src/components/PlatformSection.tsx')
        const section = renderToStaticMarkup(createElement(PlatformSection))
        const marker = '</noscript>'
        if (!html.includes(marker)) throw new Error('Missing existing no-script fallback')
        return html.replace(marker, `${marker}\n      <main id="main">${section}</main>`)
      } finally {
        await server.close()
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), platformFallback()],
  base: './',
})
