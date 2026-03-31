import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { createLicense } from '@/lib/licenseKeys'
import { sendLicenseKeyEmail } from '@/lib/mailer'

const POCKETFI_BASE = 'https://api.pocketfi.ng/api/v1'
const POCKETFI_TOKEN = process.env.POCKETFI_SECRET_KEY!

const AMOUNT_TO_PLAN: Record<number, string> = {
  1500: 'weekly',
  5000: 'monthly',
  45000: 'yearly',
}

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get('ref') ||
                    req.nextUrl.searchParams.get('payment_id')

  if (!paymentId) {
    return NextResponse.json({ error: 'Missing payment ID' }, { status: 400 })
  }

  try {
    // Check if already processed
    const existing = await db.collection('payments').doc(paymentId).get()
    if (existing.exists) {
      const data = existing.data()!
      return NextResponse.json({ licenseKey: data.licenseKey, plan: data.plan })
    }

    // Confirm payment with Pocketfi
    const res = await fetch(`${POCKETFI_BASE}/checkout/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${POCKETFI_TOKEN}`,
      },
      body: JSON.stringify({ payment_id: paymentId }),
    })

    const data = await res.json()
    console.log('Pocketfi confirm response:', JSON.stringify(data))

    // Check if payment is confirmed
    const status = data?.status
    const amount = Math.round(parseFloat(data?.amount || '0'))

    if (status !== 'completed' && status !== 'success' && status !== 'paid') {
      return NextResponse.json({ pending: true, status })
    }

    // Determine plan from amount
    let plan = AMOUNT_TO_PLAN[amount]
    if (!plan) {
      if (amount <= 2000) plan = 'weekly'
      else if (amount <= 6000) plan = 'monthly'
      else plan = 'yearly'
    }

    // Get email from payment_meta
    const meta = await db.collection('payment_meta').doc(paymentId).get()
    const email = meta.exists ? meta.data()?.email : null
    const firstName = meta.exists ? meta.data()?.firstName : null

    // Generate license key
    const licenseKey = await createLicense({
      plan: plan as any,
      reference: paymentId,
      amount,
      email,
    })

    // Calculate expiry
    const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

    // Save payment record
    await db.collection('payments').doc(paymentId).set({
      reference: paymentId,
      amount,
      plan,
      licenseKey,
      email: email || null,
      processedAt: new Date().toISOString(),
    })

    // Send email
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
  } catch (err) {
    console.error('Status check error:', err)
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 })
  }
}