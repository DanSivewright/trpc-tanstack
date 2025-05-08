import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

const serviceAccount = JSON.parse(import.meta.env.FIREBASE_SERVICE_ACCOUNT_KEY)
// Initialize Firebase Admin only if no apps exist
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(serviceAccount),
      })
    : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
