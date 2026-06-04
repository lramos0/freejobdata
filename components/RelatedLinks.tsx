import Link from "next/link"

export function RelatedLinks({ links }: { links: { label: string; href: string }[] }) {
  return (
    <section className="card">
      <h3>Related intelligence</h3>
      {links.map((link) =>
        link.href.startsWith("http") ? (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ) : (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        )
      )}
    </section>
  )
}
