import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

const NOWPAYMENTS_API = 'https://api.nowpayments.io/v1'
const API_KEY = process.env.NOWPAYMENTS_API_KEY!

const PLAN_AMOUNTS: Record<string, string> = {
  weekly: '1.50',
  monthly: '3.99',
  yearly: '14.99',
}

const PLAN_LABELS: Record<string, string> = {
  weekly: 'ProxySocket Weekly Plan',
  monthly: 'ProxySocket Monthly Plan',
  yearly: 'ProxySocket Yearly Plan',
}

export async function POST(req: NextRequest) {
  try {
    const { plan, email } = await req.json()

    if (!plan || !PLAN_AMOUNTS[plan]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const orderId = `psk-${plan}-${Date.now()}`
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/proxysocket/success`

    const body = {
      price_amount: parseFloat(PLAN_AMOUNTS[plan]),
      price_currency: 'usd',
      order_id: orderId,
      order_description: PLAN_LABELS[plan],
      success_url: successUrl,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/proxysocket/pay?cancelled=1`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/crypto-webhook`,
    }

    const res = await fetch(`${NOWPAYMENTS_API}/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()
    console.log('NOWPayments response:', JSON.stringify(data))

    if (!res.ok || !data.invoice_url) {
      console.error('NOWPayments error:', data)
      return NextResponse.json({ error: data.message || 'Payment creation failed' }, { status: 500 })
    }

    const paymentId = data.id?.toString() || orderId

    // Store email and plan for webhook
    if (email) {
      await db.collection('payment_meta').doc(paymentId).set({
        email,
        plan,
        orderId,
        provider: 'nowpayments',
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      payment_link: data.invoice_url,
      payment_id: paymentId,
    })
  } catch (err) {
    console.error('Crypto payment initiation error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}