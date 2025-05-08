import { cert, getApps, initializeApp } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getFirestore } from "firebase-admin/firestore"

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n")
}

const params = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  clientEmail: import.meta.env.FIREBASE_CLIENT_EMAIL as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  privateKey: import.meta.env.FIREBASE_PRIVATE_KEY as string,
}

// Initialize Firebase Admin only if no apps exist
const app =
  getApps().length === 0
    ? initializeApp({
        credential: cert({
          projectId: params.projectId,
          clientEmail: params.clientEmail,
          privateKey: formatPrivateKey(params.privateKey),
        }),
        storageBucket: params.storageBucket,
      })
    : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
