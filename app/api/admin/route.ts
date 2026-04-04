import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { createLicense } from '@/lib/licenseKeys'
import { sendLicenseKeyEmail } from '@/lib/mailer'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

// Verify admin password from header
function isAuthorized(req: NextRequest): boolean {
  const auth = req.headers.get('x-admin-key')
  return auth === ADMIN_PASSWORD
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const action = req.nextUrl.searchParams.get('action')

  try {
    if (action === 'licenses') {
      const snap = await db.collection('licenses').orderBy('createdAt', 'desc').limit(100).get()
      const licenses = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return NextResponse.json({ licenses })
    }

    if (action === 'payments') {
      const snap = await db.collection('payments').orderBy('processedAt', 'desc').limit(100).get()
      const payments = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      return NextResponse.json({ payments })
    }

    if (action === 'stats') {
      const [licSnap, paySnap] = await Promise.all([
        db.collection('licenses').get(),
        db.collection('payments').get(),
      ])
      const now = new Date()
      const licenses = licSnap.docs.map(d => d.data())
      const active = licenses.filter(l => new Date(l.expiresAt) > now).length
      const expired = licenses.length - active
      const payments = paySnap.docs.map(d => d.data())
      const nairaRevenue = payments.filter(p => p.currencyLocal === 'NGN' || (!p.provider || p.provider === 'pocketfi')).reduce((sum, p) => sum + (parseFloat(p.amountLocal || p.amount) || 0), 0)
      const usdRevenue = payments.filter(p => p.provider === 'nowpayments').reduce((sum, p) => sum + (parseFloat(p.amountLocal || p.amount) || 0), 0)
      const inAppRevenue = payments.filter(p => p.provider === 'revenuecat').reduce((sum, p) => sum + (parseFloat(p.amountUSD) || 0), 0)
      const totalUSD = payments.reduce((sum, p) => sum + (parseFloat(p.amountUSD) || 0), 0)
      const byPlatform = {
        web: payments.filter(p => p.platform === 'web').length,
        ios: payments.filter(p => p.platform === 'ios').length,
        android: payments.filter(p => p.platform === 'android').length,
      }
      return NextResponse.json({
        totalLicenses: licenses.length,
        activeLicenses: active,
        expiredLicenses: expired,
        totalPayments: paySnap.size,
        nairaRevenue: nairaRevenue.toFixed(2),
        usdRevenue: usdRevenue.toFixed(2),
        inAppRevenue: inAppRevenue.toFixed(2),
        totalUSD: totalUSD.toFixed(2),
        byPlatform,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Admin GET error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { action } = body

    // Update Naira pricing
    if (action === 'pricing') {
      const { weekly_ngn, monthly_ngn, yearly_ngn, note } = body
      await db.collection('config').doc('pricing').set({
        weekly:  { ngn: parseInt(weekly_ngn),  usd: 0.99  },
        monthly: { ngn: parseInt(monthly_ngn), usd: 1.99  },
        yearly:  { ngn: parseInt(yearly_ngn),  usd: 9.99  },
        updatedAt: new Date().toISOString(),
        note: note || '',
      })
      return NextResponse.json({ success: true })
    }

    // Generate license key manually
    if (action === 'generate') {
      const { email, plan, sendEmail } = body
      if (!email || !plan) return NextResponse.json({ error: 'Email and plan required' }, { status: 400 })

      const licenseKey = await createLicense({ plan, reference: `manual-${Date.now()}`, amount: 0, email })

      const durations: Record<string, number> = { weekly: 7, monthly: 30, yearly: 365 }
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + (durations[plan] || 30))

      if (sendEmail) {
        await sendLicenseKeyEmail({ to: email, firstName: email.split('@')[0], licenseKey, plan, expiresAt: expiresAt.toISOString() })
      }

      return NextResponse.json({ licenseKey, expiresAt: expiresAt.toISOString() })
    }

    // Revoke license key
    if (action === 'revoke') {
      const { key } = body
      await db.collection('licenses').doc(key).update({ expiresAt: new Date().toISOString() })
      return NextResponse.json({ success: true })
    }

    // Extend license key
    if (action === 'extend') {
      const { key, days } = body
      const doc = await db.collection('licenses').doc(key).get()
      if (!doc.exists) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
      const current = new Date(doc.data()!.expiresAt)
      const newExpiry = new Date(Math.max(current.getTime(), Date.now()))
      newExpiry.setDate(newExpiry.getDate() + (days || 30))
      await db.collection('licenses').doc(key).update({ expiresAt: newExpiry.toISOString() })
      return NextResponse.json({ newExpiry: newExpiry.toISOString() })
    }

    // Send email with existing key
    if (action === 'resend') {
      const { key } = body
      const doc = await db.collection('licenses').doc(key).get()
      if (!doc.exists) return NextResponse.json({ error: 'Key not found' }, { status: 404 })
      const data = doc.data()!
      if (!data.email) return NextResponse.json({ error: 'No email on record' }, { status: 400 })
      await sendLicenseKeyEmail({ to: data.email, firstName: data.email.split('@')[0], licenseKey: key, plan: data.plan, expiresAt: data.expiresAt })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err) {
    console.error('Admin POST error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}