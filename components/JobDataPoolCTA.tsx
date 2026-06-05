export function JobDataPoolCTA({
  title = "Need the full dataset?",
  body = "Use JobDataPool for API access, historical job postings, company hiring data, and labor market intelligence."
}: {
  title?: string
  body?: string
}) {
  return (
    <section className="cta">
      <h2>{title}</h2>
      <p>{body}</p>
      <div className="pill-row">
        <a className="button" href="https://jobdatapool.com/#api">
          Get this data via API
        </a>
        <a className="button secondary" href="https://jobdatapool.com/datasets">
          Download full historical dataset
        </a>
      </div>
    </section>
  )
}
