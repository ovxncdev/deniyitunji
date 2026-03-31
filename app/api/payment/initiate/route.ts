import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { db } from '@/lib/firebase'
=======
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5

const POCKETFI_BASE = 'https://api.pocketfi.ng/api/v1'
const POCKETFI_TOKEN = process.env.POCKETFI_SECRET_KEY!
const POCKETFI_BUSINESS_ID = process.env.POCKETFI_BUSINESS_ID!

const PLAN_AMOUNTS: Record<string, number> = {
  weekly: 1500,
  monthly: 5000,
  yearly: 45000,
}

const PLAN_LABELS: Record<string, string> = {
  weekly: 'ProxySocket Weekly Plan',
  monthly: 'ProxySocket Monthly Plan',
  yearly: 'ProxySocket Yearly Plan',
}

export async function POST(req: NextRequest) {
  try {
<<<<<<< HEAD
    const { plan, email } = await req.json()
=======
    const { plan, email, firstName, lastName, phone } = await req.json()
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5

    if (!plan || !PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

<<<<<<< HEAD
    // Extract name from email — john.doe@gmail.com → John / Doe
    const localPart = (email || '').split('@')[0]
    const nameParts = localPart.split(/[.\-_+]/).filter(Boolean)
    const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
    const firstName = capitalize(nameParts[0] || 'Customer')
    const lastName = capitalize(nameParts[1] || 'User')

=======
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
    const amount = PLAN_AMOUNTS[plan]
    const redirectLink = `${process.env.NEXT_PUBLIC_BASE_URL}/proxysocket/success`

    const res = await fetch(`${POCKETFI_BASE}/checkout/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${POCKETFI_TOKEN}`,
      },
      body: JSON.stringify({
<<<<<<< HEAD
        first_name: firstName,
        last_name: lastName,
        phone: '08000000000',
=======
        first_name: firstName || 'Customer',
        last_name: lastName || '',
        phone: phone || '08000000000',
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
        business_id: POCKETFI_BUSINESS_ID,
        email: email || 'customer@proxysocket.app',
        redirect_link: redirectLink,
        amount: amount.toString(),
        description: PLAN_LABELS[plan],
<<<<<<< HEAD
=======
        // Store plan in description so webhook knows which plan was paid
        metadata: JSON.stringify({ plan }),
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('Pocketfi error:', data)
      return NextResponse.json({ error: 'Payment initiation failed', details: data }, { status: 500 })
    }

<<<<<<< HEAD
    // Store email so webhook can send the license key email
    const paymentId = data?.data?.payment_id || data?.payment_id || null
    if (paymentId && email) {
      await db.collection('payment_meta').doc(paymentId).set({
        email,
        firstName,
        lastName,
        plan,
        createdAt: new Date().toISOString(),
      })
    }

=======
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
    return NextResponse.json(data)
  } catch (err) {
    console.error('Payment initiation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 29eb44fba430ada276e121745d5b45d467e175e5
