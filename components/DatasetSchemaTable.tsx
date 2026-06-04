export function DatasetSchemaTable({ schema }: { schema: Record<string, string> }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(schema).map(([field, description]) => (
            <tr key={field}>
              <td>{field}</td>
              <td>{description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
