import { OrgChartDiagram } from './diagrams/OrgChartDiagram'
import { ProofDiagram } from './diagrams/ProofDiagram'
import { CareerDiagram } from './diagrams/CareerDiagram'
import { WeeklyDiagram } from './diagrams/WeeklyDiagram'
import { ContextDiagram } from './diagrams/ContextDiagram'

const proposals = [
  {
    order: 1,
    title: 'Quién ocupa cada cargo hoy',
    promise: 'Encuentra en segundos quién está a cargo de cualquier entidad de los tres poderes.',
    description: 'El organigrama de cada entidad, con el nombre de quien ocupa cada cargo.',
    diagram: OrgChartDiagram,
  },
  {
    order: 2,
    title: 'Cada dato con su prueba',
    promise: 'Cada designación y cada cese enlazan a la norma que los respalda.',
    description: 'Con copia archivada y un enlace permanente que se puede citar.',
    diagram: ProofDiagram,
  },
  {
    order: 3,
    title: 'La trayectoria de cada funcionario',
    promise: 'Mira dónde estuvo antes, cuánto duró en cada cargo y a dónde fue después.',
    description: 'El historial de cargos dentro del Estado, armado con las mismas normas.',
    diagram: CareerDiagram,
  },
  {
    order: 4,
    title: 'Lo que cambió esta semana',
    promise: 'Cada lunes, las designaciones, ceses y rotaciones de la semana en un solo resumen.',
    description: 'Filtrable por poder, sector o entidad, con alertas por correo.',
    diagram: WeeklyDiagram,
  },
  {
    order: 5,
    title: 'Contexto verificado en un solo lugar',
    promise: 'Documentos públicos y noticias de cada funcionario y entidad, reunidos y verificados.',
    description: 'Se enlazan las fuentes; la plataforma no resume ni opina.',
    diagram: ContextDiagram,
  },
]

export function PlatformSection() {
  return (
    <section className="platform section" id="plataforma">
      <div className="section-intro" data-reveal>
        <div>
          <p className="eyebrow"><span /> Una propuesta en construcción</p>
          <h2 tabIndex={-1}>El Estado peruano, a la vista de todos.</h2>
        </div>
        <p>Proponemos reunir en un solo lugar quién ocupa cada cargo de los tres poderes, con la norma que lo respalda y la información pública que le da contexto.</p>
      </div>
      <div className="platform-grid" data-reveal>
        {proposals.map(({ order, title, promise, description, diagram: Diagram }) => (
          <article key={order} className={order > 3 ? 'is-wide' : undefined} data-order={String(order).padStart(2, '0')}>
            <div className="platform-art"><Diagram /></div>
            <h3>{title}</h3>
            <p className="platform-promise">{promise}</p>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
