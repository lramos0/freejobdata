export function DataTable({ rows }: { rows: Record<string, string | number>[] }) {
  const headers = rows[0] ? Object.keys(rows[0]) : []

  if (!headers.length) {
    return (
      <div className="table-empty">
        Metrics are waiting on the next JobDataPool snapshot. Seed pages still include summary cards and methodology.
      </div>
    )
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              {headers.map((header) => (
                <td key={header}>{row[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
