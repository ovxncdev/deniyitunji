import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createLicense } from '@/lib/licenseKeys'
import { db } from '@/lib/firebase'
<<<<<<< HEAD
import { sendLicenseKeyEmail } from '@/lib/mailer'
=======
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5

const POCKETFI_SECRET = process.env.POCKETFI_WEBHOOK_SECRET!

const AMOUNT_TO_PLAN: Record<number, string> = {
  1500: 'weekly',
  5000: 'monthly',
  45000: 'yearly',
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text()
<<<<<<< HEAD
    const signature = req.headers.get('HTTP_POCKETFI_SIGNATURE')
      || req.headers.get('pocketfi-signature')
      || ''

=======
    const signature = req.headers.get('HTTP_POCKETFI_SIGNATURE') || req.headers.get('pocketfi-signature') || ''

    // Verify webhook signature
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
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

    // Prevent duplicate processing
    const existing = await db.collection('payments').doc(reference).get()
    if (existing.exists) {
<<<<<<< HEAD
=======
      console.log('Duplicate webhook for reference:', reference)
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
      return NextResponse.json({ message: 'success' }, { status: 200 })
    }

    // Determine plan from amount
    let plan = AMOUNT_TO_PLAN[amount]
    if (!plan) {
<<<<<<< HEAD
      if (description.toLowerCase().includes('weekly')) plan = 'weekly'
      else if (description.toLowerCase().includes('yearly')) plan = 'yearly'
      else plan = 'monthly'
    }

    // Get email + name stored from initiate step
    const paymentMeta = await db.collection('payment_meta').doc(reference).get()
    const email = paymentMeta.exists ? paymentMeta.data()?.email : null
    const firstName = paymentMeta.exists ? paymentMeta.data()?.firstName : null

=======
      // Try to extract from description as fallback
      if (description.toLowerCase().includes('weekly')) plan = 'weekly'
      else if (description.toLowerCase().includes('monthly')) plan = 'monthly'
      else if (description.toLowerCase().includes('yearly')) plan = 'yearly'
      else plan = 'monthly' // default fallback
    }

>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
    // Generate license key
    const licenseKey = await createLicense({
      plan: plan as any,
      reference,
      amount,
<<<<<<< HEAD
      email,
    })

    // Expiry date
    const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

    // Record the payment
    await db.collection('payments').doc(reference).set({
      reference, amount, plan, licenseKey,
      email: email || null,
      processedAt: new Date().toISOString(),
    })

    // Send license key email
    if (email) {
      try {
        await sendLicenseKeyEmail({
          to: email,
          firstName: firstName || '',
          licenseKey,
          plan,
          expiresAt: expiresAt.toISOString(),
        })
        console.log(`License email sent to ${email}`)
      } catch (emailErr) {
        console.error('Failed to send email:', emailErr)
        // Don't fail the webhook if email fails
      }
    }

    console.log(`License generated: ${licenseKey} for ref: ${reference} (${plan})`)
=======
    })

    // Record the payment
    await db.collection('payments').doc(reference).set({
      reference,
      amount,
      plan,
      licenseKey,
      processedAt: new Date().toISOString(),
    })

    console.log(`License generated: ${licenseKey} for reference: ${reference} (${plan})`)

>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
    return NextResponse.json({ message: 'success' }, { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}
