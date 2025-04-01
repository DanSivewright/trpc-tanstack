import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

// Initialize Firebase Admin only if no apps exist
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert(
          "iwin-io-beta-firebase-adminsdk-exk6h-a5a47c6190.json"
        ),
      })
    : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
