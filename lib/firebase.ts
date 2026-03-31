import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || ''
  const privateKey = rawKey
    .replace(/\\n/g, '\n')
    .replace(/^"|"$/g, '')

  console.log('Firebase key starts:', privateKey.substring(0, 50))
  console.log('Firebase key ends:', privateKey.substring(privateKey.length - 30))
  console.log('Firebase project:', process.env.FIREBASE_PROJECT_ID)
  console.log('Firebase email:', process.env.FIREBASE_CLIENT_EMAIL)

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

export const db = getFirestore()