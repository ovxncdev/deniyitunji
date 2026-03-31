import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref')
  if (!ref) return NextResponse.json({ error: 'Missing reference' }, { status: 400 })

  try {
    const doc = await db.collection('payments').doc(ref).get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    const data = doc.data()!
    return NextResponse.json({ licenseKey: data.licenseKey, plan: data.plan })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}
