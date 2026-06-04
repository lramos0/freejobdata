import Link from "next/link"

export function EntityHeader({
  eyebrow,
  title,
  description,
  tags = []
}: {
  eyebrow: string
  title: string
  description?: string
  tags?: string[]
}) {
  return (
    <section className="hero">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      {description ? <p className="lede">{description}</p> : null}
      <div className="pill-row">
        {tags.map((tag) => (
          <span className="pill" key={tag}>
            {tag}
          </span>
        ))}
      </div>
      <Link className="button" href="/methodology">
        View methodology
      </Link>
    </section>
  )
}
