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

function csvRowsToObjects(rows, options = {}) {
  if (!rows.length) return []
  const headers = (rows[0] || []).map((raw, idx) => {
    const clean = String(raw || "").replace(/^\uFEFF/, "").trim()
    return clean || `column_${idx}`
  })
  const keepColumns = Array.isArray(options.columns) ? new Set(options.columns) : null

  const out = []
  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r] || []
    const obj = {}
    let hasAnyValue = false
    for (let c = 0; c < headers.length; c++) {
      if (keepColumns && !keepColumns.has(headers[c])) continue
      const val = cols[c] ?? ""
      obj[headers[c]] = val
      if (!hasAnyValue && String(val).trim()) hasAnyValue = true
    }
    if (hasAnyValue) out.push(obj)
  }
  return out
}

function parseCsvText(csvText, options = {}) {
  return csvRowsToObjects(parseCsvRows(csvText), options)
}

function parseCsvTextSelected(csvText, columns) {
  const keepColumns = new Set(columns || [])
  const rows = []
  let headers = null
  let keepIndexes = null
  let row = []
  let field = ""
  let inQuotes = false

  function finishField() {
    row.push(field)
    field = ""
  }

  function finishRow() {
    if (!headers) {
      headers = row.map((raw, idx) => {
        const clean = String(raw || "").replace(/^\uFEFF/, "").trim()
        return clean || `column_${idx}`
      })
      keepIndexes = headers
        .map((header, index) => (keepColumns.has(header) ? index : -1))
        .filter((index) => index >= 0)
    } else if (row.some((value) => String(value || "").trim())) {
      const obj = {}
      let hasAnyValue = false
      for (const index of keepIndexes) {
        const value = row[index] ?? ""
        obj[headers[index]] = value
        if (!hasAnyValue && String(value).trim()) hasAnyValue = true
      }
      if (hasAnyValue) rows.push(obj)
    }
    row = []
  }

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
      finishField()
      continue
    }
    if (ch === "\n") {
      finishField()
      finishRow()
      continue
    }
    if (ch === "\r") continue
    field += ch
  }

  if (field.length > 0 || row.length > 0) {
    finishField()
    finishRow()
  }

  return rows
}

module.exports = {
  parseCsvRows,
  csvRowsToObjects,
  parseCsvText,
  parseCsvTextSelected,
}
