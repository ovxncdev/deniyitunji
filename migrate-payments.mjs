// migrate-payments.mjs
// Fixes old payment records to use the new standardized schema
// Run: node migrate-payments.mjs

import { initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'

const FIREBASE_SERVICE_ACCOUNT = JSON.parse(readFileSync('./proxysocket-eaa3d-firebase-adminsdk-fbsvc-147020793e.json', 'utf8'))

const PLAN_USD = { weekly: 0.99, monthly: 1.99, yearly: 9.99 }

initializeApp({ credential: cert(FIREBASE_SERVICE_ACCOUNT) })
const db = getFirestore()

async function migrate() {
  const snap = await db.collection('payments').get()
  console.log(`Found ${snap.size} payment records\n`)

  let fixed = 0
  for (const doc of snap.docs) {
    const data = doc.data()
    const updates = {}

    // Fix missing amountUSD
    if (!data.amountUSD && data.plan) {
      updates.amountUSD = PLAN_USD[data.plan] || 0
    }

    // Fix missing currencyLocal — if amount is > 100 it's NGN
    if (!data.currencyLocal) {
      const amount = parseFloat(data.amount || data.amountLocal || 0)
      updates.currencyLocal = amount > 100 ? 'NGN' : 'USD'
      updates.amountLocal = amount
    }

    // Fix missing provider
    if (!data.provider) {
      updates.provider = 'pocketfi'
    }

    // Fix missing platform
    if (!data.platform) {
      updates.platform = 'web'
    }

    if (Object.keys(updates).length > 0) {
      await db.collection('payments').doc(doc.id).update(updates)
      console.log(`✓ Fixed ${doc.id}: ${JSON.stringify(updates)}`)
      fixed++
    }
  }

  console.log(`\nDone — fixed ${fixed} records`)
  process.exit(0)
}

migrate().catch(console.error)
