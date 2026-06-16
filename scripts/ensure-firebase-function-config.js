/**
 * Writes Firebase project ID for Netlify Functions at build time.
 * NEXT_PUBLIC_* vars are inlined into the Next.js client but are not always
 * available to standalone function runtimes; baking avoids 503 auth errors.
 */
const fs = require("fs")
const path = require("path")

function readDotenvValue(filePath, key) {
  if (!fs.existsSync(filePath)) return ""
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/)
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!match || match[1] !== key) continue
    return match[2].trim().replace(/^["']|["']$/g, "")
  }
  return ""
}

function projectIdFromAuthDomain(authDomain) {
  const match = String(authDomain || "").trim().match(/^([a-z0-9-]+)\.firebaseapp\.com$/i)
  return match ? match[1] : ""
}

const localProjectId = readDotenvValue(path.join(process.cwd(), ".env.local"), "NEXT_PUBLIC_FIREBASE_PROJECT_ID")
const localAuthDomain = readDotenvValue(path.join(process.cwd(), ".env.local"), "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN")
const projectId =
  String(
    process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      localProjectId ||
      projectIdFromAuthDomain(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || localAuthDomain)
  ).trim()

const outFile = path.join(process.cwd(), "netlify", "functions", "_shared", "firebase-runtime.json")

fs.mkdirSync(path.dirname(outFile), { recursive: true })
fs.writeFileSync(outFile, `${JSON.stringify({ projectId }, null, 2)}\n`, "utf8")

if (!projectId) {
  console.warn(
    "ensure-firebase-function-config: no Firebase project ID in env; set FIREBASE_PROJECT_ID or NEXT_PUBLIC_FIREBASE_PROJECT_ID before deploy."
  )
} else {
  console.log("ensure-firebase-function-config: wrote Firebase project ID for Netlify functions.")
}
