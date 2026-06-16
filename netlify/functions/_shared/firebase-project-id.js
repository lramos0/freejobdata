const fs = require("fs")
const path = require("path")

const PUBLIC_FIREBASE_PROJECT_ID = "thehiringcafe"
let bakedProjectId = ""

try {
  const configPath = path.join(__dirname, "firebase-runtime.json")
  if (fs.existsSync(configPath)) {
    bakedProjectId = String(JSON.parse(fs.readFileSync(configPath, "utf8")).projectId || "").trim()
  }
} catch {
  bakedProjectId = ""
}

function firebaseProjectId() {
  return (
    String(process.env.FIREBASE_PROJECT_ID || "").trim() ||
    String(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim() ||
    bakedProjectId ||
    PUBLIC_FIREBASE_PROJECT_ID
  )
}

module.exports = { firebaseProjectId }
