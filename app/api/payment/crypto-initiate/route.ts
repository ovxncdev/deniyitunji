import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { createHash } from 'crypto'

const CRYPTOMUS_API = 'https://api.cryptomus.com/v1'
const MERCHANT_ID = process.env.CRYPTOMUS_MERCHANT_ID!
const API_KEY = process.env.CRYPTOMUS_API_KEY!

const PLAN_AMOUNTS: Record<string, string> = {
  weekly: '0.99',
  monthly: '1.99',
  yearly: '9.99',
}

const PLAN_LABELS: Record<string, string> = {
  weekly: 'ProxySocket Weekly Plan',
  monthly: 'ProxySocket Monthly Plan',
  yearly: 'ProxySocket Yearly Plan',
}

function makeSign(body: object): string {
  const json = JSON.stringify(body)
  const base64 = Buffer.from(json).toString('base64')
  return createHash('md5').update(base64 + API_KEY).digest('hex')
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json()

    if (!plan || !PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const orderId = `psk-${plan}-${Date.now()}`
    const amount = PLAN_AMOUNTS[plan]
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/proxysocket/success`

    const body = {
      amount,
      currency: 'USD',
      order_id: orderId,
      url_success: successUrl,
      url_return: `${process.env.NEXT_PUBLIC_BASE_URL}/proxysocket/pay`,
      url_callback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/crypto-webhook`,
      lifetime: 3600,
      additional_data: JSON.stringify({ plan, email }),
    }

    const sign = makeSign(body)

    const res = await fetch(`${CRYPTOMUS_API}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'merchant': MERCHANT_ID,
        'sign': sign,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (data.state !== 0) {
      console.error('Cryptomus error:', data)
      return NextResponse.json({ error: data.message || 'Payment creation failed' }, { status: 500 })
    }

    const result = data.result
    const paymentId = result.uuid

    // Store email and plan for webhook
    if (paymentId && email) {
      await db.collection('payment_meta').doc(paymentId).set({
        email,
        plan,
        orderId,
        provider: 'cryptomus',
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      payment_link: result.url,
      payment_id: paymentId,
    })
  } catch (err) {
    console.error('Crypto payment initiation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}