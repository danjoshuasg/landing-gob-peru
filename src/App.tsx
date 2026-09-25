import { useEffect, useRef, useState } from 'react'
import { Picture } from './components/Picture'
import { ScatteredDocsScene } from './components/diagrams/ScatteredDocsScene'
import { PeopleGraphScene } from './components/diagrams/PeopleGraphScene'
import { ArchiveDrawerScene } from './components/diagrams/ArchiveDrawerScene'
import { StampScene } from './components/diagrams/StampScene'
import { NoticeBoardScene } from './components/diagrams/NoticeBoardScene'
import { PlatformSection } from './components/PlatformSection'

const navItems = [
  { label: 'El problema', href: '#problema' },
  { label: 'Cómo funciona', href: '#metodo' },
  { label: 'Para quién', href: '#para-quien' },
  { label: 'Plataforma', href: '#plataforma' },
  { label: 'Principios', href: '#principios' },
]

const roles = [
  { number: '01', eyebrow: 'Ciudadanos', title: 'Saber quién ocupa cada cargo', copy: 'Encontrar el lugar de cada cargo en la estructura del Estado y consultar la fuente de la información.' },
  { number: '02', eyebrow: 'Periodistas', title: 'Seguir el rastro de un cambio', copy: 'Leer una estructura ordenada y acudir a los documentos públicos que sustentan cada dato.' },
]

const principles = [
  ['Cada dato con su fuente', 'La información se presenta junto con el documento público que permite comprobarla.'],
  ['Neutralidad', 'Se enlaza la información, no se opina sobre las personas ni sobre sus decisiones.'],
  ['Protección de datos personales', 'Solo se presenta información pública pertinente al cargo; la exposición de datos personales requiere cuidado.'],
]

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3 8h9M9 4l4 4-4 4" />
    </svg>
  )
}

function MarkIcon() {
  return (
    <svg viewBox="0 0 38 38" aria-hidden="true">
      <path d="M19 3 34 11.5v15L19 35 4 26.5v-15L19 3Z" />
      <path d="m12 15 7-4 7 4v8l-7 4-7-4v-8Z" />
      <path d="M19 11v16M12 15l14 8M26 15l-14 8" />
    </svg>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuToggleRef = useRef<HTMLButtonElement>(null)

  const focusPlatformHeading = () => {
    // Keep native fragment navigation, then move keyboard focus to its heading.
    window.setTimeout(() => document.querySelector<HTMLElement>('#plataforma h2')?.focus({ preventScroll: true }), 0)
  }

  useEffect(() => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-reveal]')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }

    document.documentElement.classList.add('reveal-ready')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.14 },
    )

    nodes.forEach((node) => observer.observe(node))
    return () => {
      observer.disconnect()
      document.documentElement.classList.remove('reveal-ready')
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        menuToggleRef.current?.focus()
        return
      }

      if (event.key === 'Tab') {
        const panel = document.getElementById('mobile-navigation')
        const links = panel ? [...panel.querySelectorAll<HTMLElement>('a[href]')] : []
        const focusable = [menuToggleRef.current, ...links].filter((item): item is HTMLElement => Boolean(item))
        const first = focusable[0]
        const last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  return (
    <>
      <a className="skip-link" href="#main">Saltar al contenido</a>
      <header className="site-header">
        <div className="top-note" role="note">Sitio editorial en desarrollo · No es un canal oficial de atención del Estado peruano</div>
        <div className="nav-shell">
          <a className="brand" href="#top" aria-label="Organigrama Abierto, inicio">
            <MarkIcon />
            <span><strong>Organigrama</strong> Abierto</span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map((item) => <a key={item.href} href={item.href} onClick={item.href === '#plataforma' ? focusPlatformHeading : undefined}>{item.label}</a>)}
          </nav>
          <span className="header-status">En construcción</span>
          <button
            ref={menuToggleRef}
            className="menu-toggle"
            type="button"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span />
            <span />
          </button>
        </div>
        <nav id="mobile-navigation" className={`mobile-nav ${menuOpen ? 'is-open' : ''}`} aria-label="Navegación móvil">
          {navItems.map((item) => (
            <a key={item.href} href={item.href} tabIndex={menuOpen ? 0 : -1} onClick={() => { setMenuOpen(false); if (item.href === '#plataforma') focusPlatformHeading() }}>{item.label}<ArrowIcon /></a>
          ))}
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow"><span /> Organigrama Abierto · En construcción</p>
            <h1>Los cargos del Estado, en un organigrama abierto.</h1>
            <p className="hero-lead">Para ciudadanos y periodistas: una plataforma en construcción para conocer quién ocupa cada cargo del Estado peruano y consultar su fuente pública.</p>
            <div className="button-row">
              <a className="button button-dark" href="#plataforma" onClick={focusPlatformHeading}>Conoce la plataforma <ArrowIcon /></a>
            </div>
          </div>
          <div className="hero-stage" data-reveal>
            <Picture
              name="segunda-imagen"
              alt="Ilustración panorámica del centro empresarial de San Isidro y la vía expresa en Lima"
              width={2732}
              height={1536}
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 720px) 100vw, 92vw"
            />
            <article className="capability-card" aria-label="Presentación de Organigrama Abierto">
              <div className="card-head">
                <div className="mini-brand"><MarkIcon /><span>Organigrama<br />Abierto</span></div>
                <span className="verified">● En construcción</span>
              </div>
              <div className="card-center">
                <span className="card-label">El punto de partida</span>
                <strong>Ubicar cada cargo</strong>
                <p>Un dato, una fuente pública</p>
              </div>
              <div className="radar" aria-hidden="true">
                <svg viewBox="0 0 180 150">
                  <g className="radar-grid">
                    <path d="m90 7 75 43-8 72-67 21-67-21-8-72Z" />
                    <path d="m90 30 54 31-6 48-48 15-48-15-6-48Z" />
                    <path d="m90 53 33 19-4 24-29 9-29-9-4-24Z" />
                    <path d="M90 7v136M15 50l142 72M165 50 23 122" />
                  </g>
                  <path className="radar-value" d="m90 24 59 34-21 52-38 19-48-21-13-51Z" />
                </svg>
              </div>
              <div className="card-stats">
                <div><span>Alcance</span><b>Tres poderes</b></div>
                <div><span>Método</span><b>Fuentes</b></div>
                <div><span>Consulta</span><b>Contexto</b></div>
              </div>
            </article>
          </div>
        </section>

        <section className="statement section" id="problema">
          <div className="split-heading" data-reveal>
            <h2>La información existe.<br />Encontrarla sigue siendo difícil.</h2>
            <p>Los cargos y sus responsables aparecen en documentos públicos dispersos. Una publicación puede quedar desactualizada; reconstruir el organigrama requiere volver a las fuentes.</p>
          </div>
          <div className="comparison" data-reveal>
            <article>
              <p className="eyebrow"><span /> Información dispersa</p>
              <div className="scene-art"><ScatteredDocsScene /></div>
              <h3>Documentos separados</h3>
              <p>Los datos sobre cargos se encuentran en distintas publicaciones y formatos.</p>
            </article>
            <div className="comparison-arrow"><ArrowIcon /></div>
            <article className="comparison-focus">
              <p className="eyebrow"><span /> Una lectura común</p>
              <div className="scene-art"><PeopleGraphScene /></div>
              <h3>Estructura con fuentes</h3>
              <p>Una vista del organigrama que permita rastrear el origen de cada dato.</p>
            </article>
          </div>
        </section>

        <section className="method section" id="metodo">
          <div className="section-intro" data-reveal>
            <div>
              <p className="eyebrow"><span /> Fuentes, revisión y publicación</p>
              <h2>Cómo funciona.</h2>
            </div>
            <p>La plataforma partirá de fuentes oficiales. Cada cambio pasará por validación humana en un backoffice antes de publicar; la publicación periódica permitirá leer una estructura revisada, no una afirmación sin sustento.</p>
          </div>
          <div className="method-grid" data-reveal>
            <article><span>01</span><div className="method-icon" aria-hidden="true"><ArchiveDrawerScene /></div><h3>Consultar</h3><p>Partir de fuentes oficiales y documentos públicos sobre la estructura del Estado.</p></article>
            <article><span>02</span><div className="method-icon" aria-hidden="true"><StampScene /></div><h3>Validar</h3><p>La validación humana confirma cada cambio antes de publicar.</p></article>
            <article><span>03</span><div className="method-icon" aria-hidden="true"><NoticeBoardScene /></div><h3>Publicar</h3><p>El corte semanal de los lunes reúne lo validado hasta el viernes anterior.</p></article>
          </div>
          <div className="scope" data-reveal>
            <h3>Alcance de la primera versión</h3>
            <p><strong>Ejecutivo:</strong> hasta las direcciones de línea; en los organismos adscritos, solo alta dirección.</p>
            <p><strong>Legislativo:</strong> mesas directivas, parlamentarios, presidentes de comisión y alta dirección administrativa.</p>
            <p><strong>Judicial:</strong> Presidencia, jueces supremos, presidentes de cortes superiores y gerencia general.</p>
            <p>Los organismos constitucionales autónomos quedan fuera de esta primera versión.</p>
          </div>
        </section>

        <section className="audiences" id="para-quien">
        <div className="field section">
          <div className="field-copy" data-reveal>
            <p className="eyebrow"><span /> Para quién</p>
            <h2>Una estructura pública, dos maneras de consultarla.</h2>
            <p>Ciudadanos y periodistas necesitan encontrar cargos y responsables sin perder de vista el documento que respalda cada dato.</p>
          </div>
          <div className="field-image" data-reveal>
            <Picture
              name="box-right"
              alt="Ilustración de personas reunidas en torno a información pública"
              width={2390}
              height={1792}
              sizes="(max-width: 860px) 100vw, 56vw"
            />
            <div className="image-note"><span>Consulta pública</span><strong>Un punto de partida para volver a la fuente.</strong></div>
          </div>
        </div>

        <div className="roles section">
          <div className="section-intro" data-reveal>
            <div>
              <p className="eyebrow"><span /> Dos miradas</p>
              <h2>Información para consultar y contrastar.</h2>
            </div>
            <p>La misma estructura sirve para ubicar un cargo o para seguir una trayectoria en documentos públicos.</p>
          </div>
          <div className="role-grid" data-reveal>
            {roles.map((role) => (
              <article key={role.number}>
                <div className="role-top"><span>{role.number}</span><MarkIcon /></div>
                <p className="role-eyebrow">{role.eyebrow}</p>
                <h3>{role.title}</h3>
                <p>{role.copy}</p>
                <span className="role-line" />
              </article>
            ))}
          </div>
        </div>
        <div className="territory section">
          <div className="territory-stage" data-reveal>
            <Picture
              name="metric"
              alt="Ilustración urbana que acompaña a los públicos de la plataforma"
              width={2390}
              height={1792}
              sizes="(max-width: 760px) 100vw, 88vw"
            />
            <article className="territory-card">
              <p className="eyebrow"><span /> Para quién</p>
              <h2>Volver a la fuente.</h2>
              <p>Una lectura del organigrama que invite a contrastar cada dato en su documento público.</p>
              <div className="territory-tags"><span>Ciudadanos</span><span>Periodistas</span></div>
            </article>
          </div>
        </div>
        </section>

        <PlatformSection />

        <section className="principles section" id="principios">
          <div className="principles-title" data-reveal>
            <p className="eyebrow"><span /> Criterios editoriales</p>
            <h2>Una fuente para cada afirmación.</h2>
          </div>
          <div className="principles-list" data-reveal>
            {principles.map(([title, copy], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="closing" id="cierre">
          <div className="closing-copy" data-reveal>
            <p className="eyebrow"><span /> En construcción</p>
            <h2>Una mirada abierta al organigrama.</h2>
            <p>Organigrama Abierto es una iniciativa independiente en construcción; no es un canal oficial ni una consulta operativa. Conoce lo que la plataforma propone.</p>
            <a className="text-link" href="#plataforma" onClick={focusPlatformHeading}>Ver la plataforma <ArrowIcon /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand footer-brand" href="#top"><MarkIcon /><span><strong>Organigrama</strong> Abierto</span></a>
          <div className="footer-nav">
            <div><strong>Explorar</strong>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
            <div><strong>Información</strong><a href="#cierre">En construcción</a><a href="#top">Inicio</a></div>
          </div>
        </div>
        <div className="footer-meta"><span>Organigrama Abierto · Iniciativa independiente</span><span>En construcción · No es un canal oficial del Estado peruano.</span></div>
        <Picture
          name="panoramic-footer"
          alt="Ilustración panorámica de la Casa de Pizarro en el centro histórico de Lima"
          className="footer-panorama"
          width={3652}
          height={1152}
          sizes="100vw"
        />
      </footer>
    </>
  )
}

export default App
