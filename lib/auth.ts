import { getAuth, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import { app } from './firebase'

export function getFirebaseAuth() {
  return getAuth(app)
}

export async function signIn(email: string, password: string) {
  const auth = getFirebaseAuth()
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  const auth = getFirebaseAuth()
  return firebaseSignOut(auth)
}
