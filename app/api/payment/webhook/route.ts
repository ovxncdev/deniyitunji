import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createLicense } from '@/lib/licenseKeys'
import { db } from '@/lib/firebase'
import { sendLicenseKeyEmail } from '@/lib/mailer'

const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET!

function verifySignature(payload: string, receivedSig: string): boolean {
  const hmac = createHmac('sha512', IPN_SECRET)
  hmac.update(payload)
  const expectedSig = hmac.digest('hex')
  return expectedSig === receivedSig
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const receivedSig = req.headers.get('x-nowpayments-sig') || ''

    // Verify IPN signature
    if (!verifySignature(payload, receivedSig)) {
      console.error('Invalid NOWPayments IPN signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const data = JSON.parse(payload)
    console.log('NOWPayments webhook:', JSON.stringify(data))

    const status = data.payment_status
    const paymentId = data.invoice_id?.toString() || data.order_id
    const orderId = data.order_id

    // Only process finished payments
    if (status !== 'finished' && status !== 'confirmed') {
      return NextResponse.json({ message: 'ignored' }, { status: 200 })
    }

    // Prevent duplicate processing
    const docId = paymentId || orderId
    const existing = await db.collection('payments').doc(docId).get()
    if (existing.exists) {
      return NextResponse.json({ message: 'success' }, { status: 200 })
    }

    // Get email and plan from payment_meta
    const meta = await db.collection('payment_meta').doc(docId).get()
    const email = meta.exists ? meta.data()?.email : null
    const plan = meta.exists ? meta.data()?.plan : 'monthly'

    // Generate license key
    const licenseKey = await createLicense({
      plan: plan as any,
      reference: docId,
      amount: parseFloat(data.price_amount || '0'),
      email,
    })

    // Expiry
    const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

    // Save payment
    await db.collection('payments').doc(docId).set({
      reference: docId,
      orderId,
      amount: data.price_amount,
      currency: data.price_currency,
      payCurrency: data.pay_currency,
      plan,
      licenseKey,
      email: email || null,
      provider: 'nowpayments',
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

    console.log(`Crypto license generated: ${licenseKey} for ${docId}`)
    return NextResponse.json({ message: 'success' }, { status: 200 })
  } catch (err) {
    console.error('NOWPayments webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}