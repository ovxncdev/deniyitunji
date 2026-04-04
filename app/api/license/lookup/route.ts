import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()
  const ref = req.nextUrl.searchParams.get('ref')?.trim()

  try {
    // Lookup by payment reference
    if (ref) {
      const paymentDoc = await db.collection('payments').doc(ref).get()
      if (paymentDoc.exists) {
        const p = paymentDoc.data()!
        const licenseDoc = await db.collection('licenses').doc(p.licenseKey).get()
        if (licenseDoc.exists) {
          const l = licenseDoc.data()!
          return NextResponse.json({
            licenses: [{
              key: l.key,
              plan: l.plan,
              expiresAt: l.expiresAt,
              createdAt: l.createdAt,
              devices: l.devices || {},
            }]
          })
        }
      }
      return NextResponse.json({ licenses: [] })
    }

    // Lookup by email
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email or payment reference required' }, { status: 400 })
    }

    const snap = await db.collection('licenses')
      .where('email', '==', email)
      .orderBy('createdAt', 'desc')
      .get()

    const licenses = snap.docs.map(doc => {
      const d = doc.data()
      return {
        key: d.key,
        plan: d.plan,
        expiresAt: d.expiresAt,
        createdAt: d.createdAt,
        devices: d.devices || {},
      }
    })

    return NextResponse.json({ licenses })
  } catch (err) {
    console.error('License lookup error:', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}