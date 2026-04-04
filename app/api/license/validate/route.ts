import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'

const MAX_DEVICES = 2

export async function POST(req: NextRequest) {
  try {
    const { key, deviceId, deviceName } = await req.json()

    if (!key) {
      return NextResponse.json({ valid: false, message: 'License key required' }, { status: 400 })
    }

    const doc = await db.collection('licenses').doc(key).get()

    if (!doc.exists) {
      return NextResponse.json({ valid: false, message: 'Invalid license key' })
    }

    const data = doc.data()!

    // Check expiry
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: 'License key has expired' })
    }

    // If no deviceId provided, just validate (web redeem page)
    if (!deviceId) {
      return NextResponse.json({
        valid: true,
        plan: data.plan,
        expiresAt: data.expiresAt,
      })
    }

    // Device tracking
    const devices: Record<string, any> = data.devices || {}
    const deviceIds = Object.keys(devices)

    // Device already registered — allow
    if (devices[deviceId]) {
      await db.collection('licenses').doc(key).update({
        [`devices.${deviceId}.lastSeen`]: new Date().toISOString(),
      })
      return NextResponse.json({
        valid: true,
        plan: data.plan,
        expiresAt: data.expiresAt,
      })
    }

    // Too many devices
    if (deviceIds.length >= MAX_DEVICES) {
      const deviceList = Object.entries(devices).map(([id, d]: any) => ({
        id,
        name: d.name || 'Unknown device',
        lastSeen: d.lastSeen || d.registeredAt,
      }))
      return NextResponse.json({
        valid: false,
        message: `This license key is already active on ${MAX_DEVICES} devices. Remove a device to continue.`,
        deviceLimitReached: true,
        devices: deviceList,
      })
    }

    // Register new device
    await db.collection('licenses').doc(key).update({
      [`devices.${deviceId}`]: {
        name: deviceName || 'Unknown device',
        registeredAt: new Date().toISOString(),
        lastSeen: new Date().toISOString(),
      },
      activatedAt: data.activatedAt || new Date().toISOString(),
    })

    return NextResponse.json({
      valid: true,
      plan: data.plan,
      expiresAt: data.expiresAt,
    })
  } catch (err) {
    console.error('License validate error:', err)
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 })
  }
}

// Deregister a device
export async function DELETE(req: NextRequest) {
  try {
    const { key, deviceId } = await req.json()

    const doc = await db.collection('licenses').doc(key).get()
    if (!doc.exists) {
      return NextResponse.json({ error: 'Key not found' }, { status: 404 })
    }

    await db.collection('licenses').doc(key).update({
      [`devices.${deviceId}`]: db.firestore.FieldValue.delete(),
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Device deregister error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}