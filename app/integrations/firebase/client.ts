import { initializeApp } from "firebase/app"
import { getAuth, OAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const config = {
  apiKey: "AIzaSyAkmV38MiDdnDg2_mhs_qvP3aYZ8WKvsWg",
  authDomain: "iwin-io-beta.firebaseapp.com",
  projectId: "iwin-io-beta",
  storageBucket: "storage.beta.i-win.io",
  messagingSenderId: "801849951924",
  appId: "1:801849951924:web:9c7a8a08be6edb2c7339e1",
  measurementId: "G-CP1WPV7NBS",
}

const app = initializeApp(config)
const db = getFirestore(app)
const auth = getAuth(app)
const storage = getStorage(app)

const provider = new OAuthProvider("microsoft.com")

export { auth, storage, provider, config }
export default db
