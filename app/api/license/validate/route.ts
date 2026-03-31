import { NextRequest, NextResponse } from 'next/server'
import { validateLicense } from '@/lib/licenseKeys'

export async function POST(req: NextRequest) {
  try {
    const { key } = await req.json()

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ valid: false, message: 'License key is required' }, { status: 400 })
    }

    const result = await validateLicense(key.trim().toUpperCase())
    return NextResponse.json(result)
  } catch (err) {
    console.error('License validation error:', err)
    return NextResponse.json({ valid: false, message: 'Validation failed' }, { status: 500 })
  }
}
