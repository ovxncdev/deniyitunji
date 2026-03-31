import { db } from './firebase'
import { randomBytes } from 'crypto'

export type Plan = 'weekly' | 'monthly' | 'yearly'

const PLAN_DURATIONS: Record<Plan, number> = {
  weekly: 7,
  monthly: 30,
  yearly: 365,
}

/**
 * Generate a unique license key in format PSK-XXXX-XXXX-XXXX
 */
export function generateKey(): string {
  const segment = () => randomBytes(2).toString('hex').toUpperCase()
  return `PSK-${segment()}-${segment()}-${segment()}`
}

/**
 * Create and store a license key after successful payment
 */
export async function createLicense(params: {
  plan: Plan
  reference: string
  amount: number
  email?: string
}): Promise<string> {
  const key = generateKey()
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + PLAN_DURATIONS[params.plan])

  await db.collection('licenses').doc(key).set({
    key,
    plan: params.plan,
    reference: params.reference,
    amount: params.amount,
    email: params.email || null,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    used: false,
    activatedAt: null,
  })

  return key
}

/**
 * Validate a license key — called by the app
 * Returns the license data if valid, null if invalid/expired
 */
export async function validateLicense(key: string): Promise<{
  valid: boolean
  plan?: Plan
  expiresAt?: string
  message?: string
}> {
  const doc = await db.collection('licenses').doc(key).get()

  if (!doc.exists) {
    return { valid: false, message: 'Invalid license key' }
  }

  const data = doc.data()!
  const now = new Date()
  const expiresAt = new Date(data.expiresAt)

  if (now > expiresAt) {
    return { valid: false, message: 'License key has expired', plan: data.plan, expiresAt: data.expiresAt }
  }

  // Mark as used on first activation
  if (!data.used) {
    await db.collection('licenses').doc(key).update({
      used: true,
      activatedAt: now.toISOString(),
    })
  }

  return {
    valid: true,
    plan: data.plan,
    expiresAt: data.expiresAt,
  }
}
