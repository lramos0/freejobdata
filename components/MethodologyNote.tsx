import Link from "next/link"

export function MethodologyNote() {
  return (
    <aside className="note">
      Metrics are derived from normalized JobDataPool job postings, deduplicated by company, role, location,
      remote status, and posting lifecycle. <Link href="/methodology">Read the methodology</Link>.
    </aside>
  )
}
