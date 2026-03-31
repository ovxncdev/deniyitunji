import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  const rawKey = process.env.FIREBASE_PRIVATE_KEY || ''
  
  let privateKey = rawKey
    .replace(/\\n/g, '\n')  // literal \n to newline
    .replace(/^"|"$/g, '')   // remove surrounding quotes

  // If newlines still missing, the key uses spaces — fix it
  if (!privateKey.includes('\n')) {
    privateKey = privateKey
      .replace('-----BEGIN PRIVATE KEY----- ', '-----BEGIN PRIVATE KEY-----\n')
      .replace(' -----END PRIVATE KEY-----', '\n-----END PRIVATE KEY-----')
      .replace(/ /g, '\n')
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  })
}

export const db = getFirestore()