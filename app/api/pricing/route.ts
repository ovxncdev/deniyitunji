import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!

const DEFAULT_PRICES = {
  weekly:  { ngn: 1500,  usd: 0.99  },
  monthly: { ngn: 5000,  usd: 1.99  },
  yearly:  { ngn: 45000, usd: 9.99  },
  updatedAt: null,
  note: '',
}

// GET — public, used by pay page
export async function GET() {
  try {
    const doc = await db.collection('config').doc('pricing').get()
    if (!doc.exists) {
      return NextResponse.json(DEFAULT_PRICES)
    }
    return NextResponse.json({ ...DEFAULT_PRICES, ...doc.data() })
  } catch (err) {
    return NextResponse.json(DEFAULT_PRICES)
  }
}

// POST — admin only
export async function POST(req: NextRequest) {
  const auth = req.headers.get('x-admin-key')
  if (auth !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { weekly_ngn, monthly_ngn, yearly_ngn, note } = await req.json()

    const pricing = {
      weekly:  { ngn: parseInt(weekly_ngn),  usd: 0.99  },
      monthly: { ngn: parseInt(monthly_ngn), usd: 1.99  },
      yearly:  { ngn: parseInt(yearly_ngn),  usd: 9.99  },
      updatedAt: new Date().toISOString(),
      note: note || '',
    }

    await db.collection('config').doc('pricing').set(pricing)
    return NextResponse.json({ success: true, pricing })
  } catch (err) {
    console.error('Pricing update error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}