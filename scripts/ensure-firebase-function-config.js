/**
 * Writes Firebase project ID for Netlify Functions at build time.
 * NEXT_PUBLIC_* vars are inlined into the Next.js client but are not always
 * available to standalone function runtimes; baking avoids 503 auth errors.
 */
const fs = require("fs")
const path = require("path")

const projectId =
  String(process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim()

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
