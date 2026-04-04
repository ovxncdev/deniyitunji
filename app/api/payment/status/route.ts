import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { createLicense } from '@/lib/licenseKeys'
import { sendLicenseKeyEmail } from '@/lib/mailer'

const POCKETFI_BASE = 'https://api.pocketfi.ng/api/v1'
const POCKETFI_TOKEN = process.env.POCKETFI_SECRET_KEY!
const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1'
const NOWPAYMENTS_KEY = process.env.NOWPAYMENTS_API_KEY!

const AMOUNT_TO_PLAN: Record<number, string> = {
  1500: 'weekly',
  5000: 'monthly',
  45000: 'yearly',
}

function isCryptoRef(ref: string): boolean {
  // NOWPayments IDs are numeric or short alphanumeric, not PFI| prefixed
  return !ref.startsWith('PFI|') && !ref.startsWith('PFI%7C')
}

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('ref') ||
                    req.nextUrl.searchParams.get('payment_id')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
  }

  try {
    // Check if already processed in Firebase
    const existing = await db.collection('payments').doc(paymentId).get()
    if (existing.exists) {
      const data = existing.data()!
      return NextResponse.json({ licenseKey: data.licenseKey, plan: data.plan })
    }

    // Route to correct provider
    if (isCryptoRef(paymentId)) {
      return await checkNowPayments(paymentId)
    } else {
      return await checkPocketfi(paymentId)
    }
  } catch (err) {
    console.error('Status check error:', err)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}

// ── Pocketfi ────────────────────────────────────────────────────────────────

async function checkPocketfi(paymentId: string) {
  const res = await fetch(`${POCKETFI_BASE}/checkout/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${POCKETFI_TOKEN}`,
    },
    body: JSON.stringify({ payment_id: paymentId }),
  })

  const data = await res.json()
  console.log('Pocketfi confirm:', JSON.stringify(data))

  const status = (data?.status || '').toLowerCase()

  // Cancelled or failed
  if (status === 'cancelled' || status === 'failed' || status === 'expired' || status === 'cancel') {
    return NextResponse.json({ cancelled: true, status })
  }

  if (status !== 'completed' && status !== 'success' && status !== 'paid') {
    return NextResponse.json({ pending: true, status })
  }

  const amount = Math.round(parseFloat(data?.amount || '0'))
  let plan = AMOUNT_TO_PLAN[amount]
  if (!plan) {
    if (amount <= 2000) plan = 'weekly'
    else if (amount <= 6000) plan = 'monthly'
    else plan = 'yearly'
  }

  return await generateAndSaveLicense(paymentId, plan, 'pocketfi', amount)
}

// ── NOWPayments ────────────────────────────────────────────────────────────

async function checkNowPayments(paymentId: string) {
  // NOWPayments: get invoice info
  const res = await fetch(`${NOWPAYMENTS_API}/invoice/${paymentId}`, {
    headers: { 'x-api-key': NOWPAYMENTS_KEY },
  })

  const data = await res.json()
  console.log('NOWPayments status:', JSON.stringify(data))

  const status = (data?.payment_status || data?.status || '').toLowerCase()

  // Cancelled/expired/failed
  if (status === 'expired' || status === 'failed' || status === 'refunded') {
    return NextResponse.json({ cancelled: true, status })
  }

  // Paid
  if (status === 'finished' || status === 'confirmed' || status === 'partially_paid') {
    const meta = await db.collection('payment_meta').doc(paymentId).get()
    const plan = meta.exists ? meta.data()?.plan : 'monthly'
    return await generateAndSaveLicense(paymentId, plan, 'nowpayments', parseFloat(data.price_amount || '0'))
  }

  // Still waiting/confirming
  return NextResponse.json({ pending: true, status })
}

// ── Shared key generation ──────────────────────────────────────────────────

async function generateAndSaveLicense(paymentId: string, plan: string, provider: string, amount: number) {
  const meta = await db.collection('payment_meta').doc(paymentId).get()
  const email = meta.exists ? meta.data()?.email : null
  const firstName = meta.exists ? (meta.data()?.firstName || email?.split('@')[0]) : null

  const licenseKey = await createLicense({
    plan: plan as any,
    reference: paymentId,
    amount,
    email,
  })

  const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

  await db.collection('payments').doc(paymentId).set({
    reference: paymentId,
    amount,
    plan,
    licenseKey,
    email: email || null,
    provider,
    processedAt: new Date().toISOString(),
  })

  if (email) {
    try {
      await sendLicenseKeyEmail({
        to: email,
        firstName: firstName || '',
        licenseKey,
        plan,
        expiresAt: expiresAt.toISOString(),
      })
    } catch (e) {
      console.error('Email send failed:', e)
    }
  }

  return NextResponse.json({ licenseKey, plan })
}