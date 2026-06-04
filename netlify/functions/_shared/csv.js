function parseCsvRows(csvText) {
  const rows = []
  let row = []
  let field = ""
  let inQuotes = false

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i]
    if (inQuotes) {
      if (ch === '"') {
        if (csvText[i + 1] === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = false
        }
      } else {
        field += ch
      }
      continue
    }
    if (ch === '"') {
      inQuotes = true
      continue
    }
    if (ch === ",") {
      row.push(field)
      field = ""
      continue
    }
    if (ch === "\n") {
      row.push(field)
      rows.push(row)
      row = []
      field = ""
      continue
    }
    if (ch === "\r") continue
    field += ch
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

function csvRowsToObjects(rows) {
  if (!rows.length) return []
  const headers = (rows[0] || []).map((raw, idx) => {
    const clean = String(raw || "").replace(/^\uFEFF/, "").trim()
    return clean || `column_${idx}`
  })

  const out = []
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r] || []
    const obj = {}
    let hasAnyValue = false
    for (let c = 0; c < headers.length; c++) {
      const val = cols[c] ?? ""
      obj[headers[c]] = val
      if (!hasAnyValue && String(val).trim()) hasAnyValue = true
    }
    if (hasAnyValue) out.push(obj)
  }
  return out
}

function parseCsvText(csvText) {
  return csvRowsToObjects(parseCsvRows(csvText))
}

module.exports = {
  parseCsvRows,
  csvRowsToObjects,
  parseCsvText,
}
