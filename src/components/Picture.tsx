type PictureProps = {
  name: 'metric' | 'segunda-imagen' | 'box-right' | 'panoramic-footer'
  alt: string
  className?: string
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  sizes: string
  width: number
  height: number
}

const variants = {
  metric: { small: 960, large: 1920 },
  'segunda-imagen': { small: 960, large: 1920 },
  'box-right': { small: 800, large: 1600 },
  'panoramic-footer': { small: 1200, large: 2560 },
} as const

export function Picture({
  name,
  alt,
  className,
  loading = 'lazy',
  fetchPriority = 'auto',
  sizes,
  width,
  height,
}: PictureProps) {
  const { small, large } = variants[name]
  const publicBase = import.meta.env.BASE_URL
  const base = `${publicBase}images/optimized/${name}`

  return (
    <picture className={className}>
      <source
        type="image/avif"
        srcSet={`${base}-${small}.avif ${small}w, ${base}-${large}.avif ${large}w`}
        sizes={sizes}
      />
      <source
        type="image/webp"
        srcSet={`${base}-${small}.webp ${small}w, ${base}-${large}.webp ${large}w`}
        sizes={sizes}
      />
      <img
        src={`${publicBase}images/source/${name}.jpeg`}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
    </picture>
  )
}
