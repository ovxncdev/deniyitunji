import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

const REVENUECAT_SECRET = process.env.REVENUECAT_WEBHOOK_SECRET!

// RevenueCat plan ID to our plan mapping
const PRODUCT_TO_PLAN: Record<string, string> = {
  'weekly': 'weekly',
  'monthly': 'monthly',
  'yearly': 'yearly',
  'proxysocket_weekly': 'weekly',
  'proxysocket_monthly': 'monthly',
  'proxysocket_yearly': 'yearly',
}

const PLAN_AMOUNTS: Record<string, number> = {
  weekly: 0.99,
  monthly: 1.99,
  yearly: 9.99,
}

export async function POST(req: NextRequest) {
  try {
    // Verify RevenueCat webhook secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== REVENUECAT_SECRET) {
      console.error('Invalid RevenueCat webhook secret')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const event = body.event
    const type = event?.type

    console.log('RevenueCat webhook:', type, JSON.stringify(event).substring(0, 200))

    // Only track initial purchases and renewals
    if (type !== 'INITIAL_PURCHASE' && type !== 'RENEWAL' && type !== 'NON_SUBSCRIPTION_PURCHASE') {
      return NextResponse.json({ message: 'ignored' }, { status: 200 })
    }

    const transactionId = event?.transaction_id || event?.original_transaction_id
    const productId = (event?.product_id || '').toLowerCase()
    const appUserId = event?.app_user_id || ''
    const platform = (event?.store || '').toLowerCase().includes('play') ? 'android' : 'ios'
    const email = event?.subscriber_attributes?.['$email']?.value || null
    const price = parseFloat(event?.price || '0')
    const currency = (event?.currency || 'USD').toUpperCase()

    if (!transactionId) {
      return NextResponse.json({ message: 'no transaction id' }, { status: 200 })
    }

    // Prevent duplicates
    const existing = await db.collection('payments').doc(transactionId).get()
    if (existing.exists) {
      return NextResponse.json({ message: 'success' }, { status: 200 })
    }

    // Map product to plan
    let plan = 'monthly'
    for (const [key, val] of Object.entries(PRODUCT_TO_PLAN)) {
      if (productId.includes(key)) { plan = val; break }
    }

    // Convert to USD if needed (approximate)
    const amountUSD = currency === 'USD' ? price : (PLAN_AMOUNTS[plan] || price)

    // Save to Firebase
    await db.collection('payments').doc(transactionId).set({
      reference: transactionId,
      provider: 'revenuecat',
      platform,
      plan,
      amountUSD,
      amountLocal: price,
      currencyLocal: currency,
      email: email || null,
      appUserId,
      productId,
      eventType: type,
      licenseKey: null, // in-app users don't need license keys
      processedAt: new Date().toISOString(),
    })

    console.log(`RevenueCat payment saved: ${transactionId} ${plan} ${platform} $${amountUSD}`)
    return NextResponse.json({ message: 'success' }, { status: 200 })
  } catch (err) {
    console.error('RevenueCat webhook error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}