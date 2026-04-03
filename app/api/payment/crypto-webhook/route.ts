import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { createLicense } from '@/lib/licenseKeys'
import { db } from '@/lib/firebase'
import { sendLicenseKeyEmail } from '@/lib/mailer'

const API_KEY = process.env.CRYPTOMUS_API_KEY!

function verifySign(body: Record<string, any>, receivedSign: string): boolean {
  const { sign: _, ...bodyWithoutSign } = body
  const json = JSON.stringify(bodyWithoutSign)
  const base64 = Buffer.from(json).toString('base64')
  const expectedSign = createHash('md5').update(base64 + API_KEY).digest('hex')
  return expectedSign === receivedSign
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('Cryptomus webhook:', JSON.stringify(body))

    // Verify signature
    const { sign } = body
    if (!sign || !verifySign(body, sign)) {
      console.error('Invalid Cryptomus webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const status = body.status
    const uuid = body.uuid
    const orderId = body.order_id

    // Only process paid or paid_over
    if (status !== 'paid' && status !== 'paid_over') {
      return NextResponse.json({ message: 'ignored' }, { status: 200 })
    }

    // Prevent duplicate processing
    const existing = await db.collection('payments').doc(uuid).get()
    if (existing.exists) {
      return NextResponse.json({ message: 'success' }, { status: 200 })
    }

    // Get email and plan from payment_meta
    const meta = await db.collection('payment_meta').doc(uuid).get()
    const email = meta.exists ? meta.data()?.email : null
    const plan = meta.exists ? meta.data()?.plan : 'monthly'

    // Generate license key
    const licenseKey = await createLicense({
      plan: plan as any,
      reference: uuid,
      amount: parseFloat(body.amount || '0'),
      email,
    })

    // Expiry
    const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

    // Save payment
    await db.collection('payments').doc(uuid).set({
      reference: uuid,
      orderId,
      amount: body.amount,
      currency: body.currency,
      plan,
      licenseKey,
      email: email || null,
      provider: 'cryptomus',
      processedAt: new Date().toISOString(),
    })

    // Send email
    if (email) {
      try {
        await sendLicenseKeyEmail({
          to: email,
          firstName: email.split('@')[0],
          licenseKey,
          plan,
          expiresAt: expiresAt.toISOString(),
        })
      } catch (e) {
        console.error('Email failed:', e)
      }
    }

    console.log(`Crypto license generated: ${licenseKey} for ${uuid}`)
    return NextResponse.json({ message: 'success' }, { status: 200 })
  } catch (err) {
    console.error('Crypto webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}