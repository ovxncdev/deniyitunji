import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')?.toLowerCase().trim()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }

  try {
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
      }
    })

    return NextResponse.json({ licenses })
  } catch (err) {
    console.error('License lookup error:', err)
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 })
  }
}
