import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createLicense } from '@/lib/licenseKeys'
import { db } from '@/lib/firebase'
import { sendLicenseKeyEmail } from '@/lib/mailer'

const POCKETFI_SECRET = process.env.POCKETFI_WEBHOOK_SECRET!

const AMOUNT_TO_PLAN: Record<number, string> = {
  1500: 'weekly',
  5000: 'monthly',
  45000: 'yearly',
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
    const signature = req.headers.get('HTTP_POCKETFI_SIGNATURE')
      || req.headers.get('pocketfi-signature')
      || ''

    const expectedHash = createHmac('sha512', POCKETFI_SECRET)
      .update(payload)
      .digest('hex')

    if (signature !== expectedHash) {
      console.error('Invalid Pocketfi webhook signature')
      return NextResponse.json({ message: 'Permission denied, invalid hash' }, { status: 400 })
    }

    const data = JSON.parse(payload)
    const reference = data?.transaction?.reference
    const amount = Math.round(parseFloat(data?.order?.amount || '0'))
    const description = data?.order?.description || ''

    if (!reference) {
      return NextResponse.json({ message: 'Missing reference' }, { status: 400 })
    }

    const existing = await db.collection('payments').doc(reference).get()
    if (existing.exists) {
      return NextResponse.json({ message: 'success' }, { status: 200 })
    }

    let plan = AMOUNT_TO_PLAN[amount]
    if (!plan) {
      if (description.toLowerCase().includes('weekly')) plan = 'weekly'
      else if (description.toLowerCase().includes('yearly')) plan = 'yearly'
      else plan = 'monthly'
    }

    const paymentMeta = await db.collection('payment_meta').doc(reference).get()
    const email = paymentMeta.exists ? paymentMeta.data()?.email : null
    const firstName = paymentMeta.exists ? paymentMeta.data()?.firstName : null

    const licenseKey = await createLicense({
      plan: plan as any,
      reference,
      amount,
      email,
    })

    const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

    await db.collection('payments').doc(reference).set({
      reference, amount, plan, licenseKey,
      email: email || null,
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
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr)
      }
    }

    return NextResponse.json({ message: 'success' }, { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
