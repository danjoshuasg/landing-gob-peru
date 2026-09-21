import { useEffect, useRef, useState } from 'react'
import { Picture } from './components/Picture'

const navItems = [
  { label: 'Visión', href: '#vision' },
  { label: 'Cómo funciona', href: '#metodo' },
  { label: 'Capacidades', href: '#capacidades' },
  { label: 'Principios', href: '#principios' },
]

const roles = [
  {
    number: '01',
    eyebrow: 'Equipos públicos',
    title: 'Decisiones con contexto',
    copy: 'Información ordenada para entender cada problema antes de elegir una respuesta.',
  },
  {
    number: '02',
    eyebrow: 'Instituciones',
    title: 'Capacidad que permanece',
    copy: 'Métodos y aprendizajes que pueden compartirse, adaptarse y sostenerse en el tiempo.',
  },
  {
    number: '03',
    eyebrow: 'Ciudadanía',
    title: 'Servicios más claros',
    copy: 'Experiencias públicas pensadas desde las necesidades reales de las personas.',
  },
]

const principles = [
  ['Evidencia antes que intuición', 'La información orienta; las personas responsables interpretan y deciden.'],
  ['Territorio antes que plantilla', 'Cada solución parte del contexto, las capacidades y las restricciones locales.'],
  ['Aprendizaje antes que novedad', 'Innovar también significa documentar, comparar y mejorar lo que ya funciona.'],
  ['Personas antes que procesos', 'La tecnología debe reducir fricción y devolver tiempo al servicio público.'],
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
          <a className="brand" href="#top" aria-label="Gob Perú, inicio">
            <MarkIcon />
            <span><strong>Gob</strong> Perú</span>
          </a>
          <nav className="desktop-nav" aria-label="Navegación principal">
            {navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
          <a className="button button-dark header-cta" href="#contacto">Conversemos</a>
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
            <a key={item.href} href={item.href} tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>{item.label}<ArrowIcon /></a>
          ))}
          <a href="#contacto" tabIndex={menuOpen ? 0 : -1} onClick={() => setMenuOpen(false)}>Conversemos<ArrowIcon /></a>
        </nav>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow"><span /> Capacidad pública</p>
            <h1>El Estado que aprende, decide mejor.</h1>
            <p className="hero-lead">Una mirada clara a cómo el conocimiento, el territorio y los servicios pueden avanzar juntos.</p>
            <div className="button-row">
              <a className="button button-dark" href="#vision">Explorar la visión <ArrowIcon /></a>
              <a className="button button-light" href="#metodo">Cómo funciona</a>
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
            <article className="capability-card" aria-label="Resumen de capacidad pública">
              <div className="card-head">
                <div className="mini-brand"><MarkIcon /><span>Capacidad<br />pública</span></div>
                <span className="verified">● Visión compartida</span>
              </div>
              <div className="card-center">
                <span className="card-label">El punto de partida</span>
                <strong>Ver mejor</strong>
                <p>Conectar evidencia y contexto</p>
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
                <div><span>Mirada</span><b>Territorio</b></div>
                <div><span>Método</span><b>Evidencia</b></div>
                <div><span>Propósito</span><b>Servicio</b></div>
              </div>
            </article>
          </div>
        </section>

        <section className="statement section" id="vision">
          <div className="split-heading" data-reveal>
            <h2>La transformación ya ocurre.<br />El reto es hacerla visible.</h2>
            <p>Las instituciones producen conocimiento todos los días. Cuando ese aprendizaje se documenta y circula, una experiencia deja de ser aislada y se convierte en capacidad pública.</p>
          </div>
          <div className="comparison" data-reveal>
            <article>
              <p className="eyebrow"><span /> Información aislada</p>
              <div className="paper-stack" aria-hidden="true">
                <div className="paper paper-one"><i /><i /><i /></div>
                <div className="paper paper-two"><i /><i /></div>
                <div className="paper paper-three"><i /><i /><i /></div>
              </div>
              <h3>Datos que se archivan</h3>
              <p>Reportes, experiencias y aprendizajes que permanecen separados.</p>
            </article>
            <div className="comparison-arrow"><ArrowIcon /></div>
            <article className="comparison-focus">
              <p className="eyebrow"><span /> Conocimiento conectado</p>
              <div className="network-mark" aria-hidden="true">
                <span /><span /><span /><span /><span />
                <svg viewBox="0 0 280 130"><path d="M28 65 91 24l96 22 63-23M28 65l66 42 93-61 63 61M94 107 91 24" /></svg>
              </div>
              <h3>Evidencia que orienta</h3>
              <p>Contexto compartido para comparar, comprender y tomar mejores decisiones.</p>
            </article>
          </div>
        </section>

        <section className="method section" id="metodo">
          <div className="section-intro" data-reveal>
            <div>
              <p className="eyebrow"><span /> Un método claro</p>
              <h2>Del aprendizaje local a una visión compartida.</h2>
            </div>
            <p>No se trata de producir más información. Se trata de convertir lo que ya sabemos en decisiones útiles, comprensibles y sostenibles.</p>
          </div>
          <div className="method-grid" data-reveal>
            <article><span>01</span><div className="method-icon observe" aria-hidden="true"><i /><i /><i /></div><h3>Observar</h3><p>Partir de la realidad, no de una solución predeterminada.</p></article>
            <article><span>02</span><div className="method-icon connect" aria-hidden="true"><i /><i /><i /><i /></div><h3>Conectar</h3><p>Relacionar experiencias, actores y evidencia relevante.</p></article>
            <article><span>03</span><div className="method-icon act" aria-hidden="true"><i /><i /></div><h3>Actuar</h3><p>Traducir el aprendizaje en decisiones que mejoran el servicio.</p></article>
          </div>
        </section>

        <section className="field section" id="capacidades">
          <div className="field-copy" data-reveal>
            <p className="eyebrow"><span /> Conocimiento que circula</p>
            <h2>Las mejores respuestas también nacen de escuchar.</h2>
            <p>Equipos, comunidades y especialistas pueden leer un mismo desafío desde ángulos distintos. Esa diversidad, bien organizada, mejora la calidad de cada decisión.</p>
            <a className="text-link" href="#principios">Conocer nuestros principios <ArrowIcon /></a>
          </div>
          <div className="field-image" data-reveal>
            <Picture
              name="box-right"
              alt="Ilustración de una sesión de intercambio sobre patrimonio y gestión pública"
              width={2390}
              height={1792}
              sizes="(max-width: 860px) 100vw, 56vw"
            />
            <div className="image-note"><span>Aprendizaje situado</span><strong>Personas que comparten experiencia para construir respuestas.</strong></div>
          </div>
        </section>

        <section className="roles section">
          <div className="section-intro" data-reveal>
            <div>
              <p className="eyebrow"><span /> Una visión, distintas miradas</p>
              <h2>Capacidad para cada nivel del servicio público.</h2>
            </div>
            <p>Una misma base de conocimiento adquiere valor diferente según quién la utiliza y qué decisión necesita tomar.</p>
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
        </section>

        <section className="territory section">
          <div className="territory-stage" data-reveal>
            <Picture
              name="metric"
              alt="Vista ilustrada del territorio urbano y su infraestructura"
              width={2390}
              height={1792}
              sizes="(max-width: 760px) 100vw, 88vw"
            />
            <article className="territory-card">
              <p className="eyebrow"><span /> Visión territorial</p>
              <h2>Una lectura común para problemas conectados.</h2>
              <p>Infraestructura, movilidad, cultura y servicios conviven en el mismo territorio. Ver sus relaciones es el primer paso para coordinar mejor.</p>
              <div className="territory-tags"><span>Contexto</span><span>Coordinación</span><span>Continuidad</span></div>
            </article>
          </div>
        </section>

        <section className="principles section" id="principios">
          <div className="principles-title" data-reveal>
            <p className="eyebrow"><span /> Diseñado para lo público</p>
            <h2>Principios antes que promesas.</h2>
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

        <section className="closing" id="contacto">
          <div className="closing-copy" data-reveal>
            <p className="eyebrow"><span /> El siguiente paso</p>
            <h2>Hagamos visible el Estado que funciona.</h2>
            <p>Conectemos experiencias, evidencia y personas para convertir aprendizaje público en mejores decisiones.</p>
            <a className="button button-dark" href="#principios">Conocer nuestros principios <ArrowIcon /></a>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <a className="brand footer-brand" href="#top"><MarkIcon /><span><strong>Gob</strong> Perú</span></a>
          <div className="footer-nav">
            <div><strong>Explorar</strong>{navItems.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</div>
            <div><strong>Institucional</strong><a href="#contacto">Contacto</a><a href="#principios">Principios</a><a href="#top">Inicio</a></div>
          </div>
        </div>
        <div className="footer-meta"><span>© {new Date().getFullYear()} Gob Perú</span><span>Una plataforma editorial en desarrollo.</span></div>
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
