import { getApp, getApps, initializeApp } from "firebase/app"
import type { FirebaseOptions } from "firebase/app"
import { getAuth } from "firebase/auth"

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
}

export type CommunityRole = "team" | "community"

export function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId)
}

export function getFirebaseAuth() {
  if (!hasFirebaseConfig()) {
    return null
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
  return getAuth(app)
}

export function roleFromClaims(claims: Record<string, unknown>): CommunityRole {
  if (
    claims.role === "freejobdata_team" ||
    claims.role === "team" ||
    claims.freejobdataRole === "team" ||
    claims.admin === true
  ) {
    return "team"
  }

  return "community"
}
