'use client'

import { useState } from 'react'
import Link from 'next/link'

type Country = 'nigeria' | 'other'
type Plan = 'weekly' | 'monthly' | 'yearly'
type Step = 'country' | 'plan' | 'details' | 'processing'

const PLANS = [
  { id: 'weekly' as Plan, label: 'Weekly', naira: '₦1,500', usd: '$0.99', per: 'per week', badge: null },
  { id: 'monthly' as Plan, label: 'Monthly', naira: '₦5,000', usd: '$1.99', per: 'per month', badge: 'POPULAR' },
  { id: 'yearly' as Plan, label: 'Yearly', naira: '₦45,000', usd: '$9.99', per: 'per year', badge: 'SAVE 25%' },
]

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Ghana', 'Kenya',
  'South Africa', 'Egypt', 'India', 'Germany', 'France', 'Australia',
  'Brazil', 'Other',
]

const FEATURES = ['All proxy locations', '9proxy integration', 'Custom proxy support', 'Kill switch']

export default function ProxySocketPage() {
  const [step, setStep] = useState<Step>('country')
  const [country, setCountry] = useState<Country | null>(null)
  const [plan, setPlan] = useState<Plan>('monthly')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const selectedPlan = PLANS.find(p => p.id === plan)!

  const handleCountrySelect = (c: string) => {
    setCountry(c === 'Nigeria' ? 'nigeria' : 'other')
    setStep('plan')
  }

  const handlePay = async () => {
    if (!firstName.trim()) { setError('First name is required'); return }
    if (!email.trim() || !email.includes('@')) { setError('Valid email is required'); return }
    if (country === 'nigeria' && !phone.trim()) { setError('Phone number is required'); return }

    setError('')
    setLoading(true)
    setStep('processing')

    try {
      const res = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, email, firstName, lastName, phone }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Payment failed. Please try again.')
        setStep('details')
        setLoading(false)
        return
      }

      const paymentUrl = data?.data?.link || data?.link || data?.payment_url || data?.url
      if (paymentUrl) {
        window.location.href = paymentUrl
      } else {
        setError('Could not get payment link. Please try again.')
        setStep('details')
        setLoading(false)
      }
    } catch {
      setError('Network error. Please check your connection.')
      setStep('details')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-base">🛡</div>
          <span className="font-bold text-lg text-foreground">ProxySocket</span>
        </Link>
        <Link href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
          Download App ↗
        </Link>
      </nav>

      <div className="max-w-[480px] mx-auto px-6 py-12 pb-20">

        {/* Hero */}
        <div className="text-center mb-10">
          <p className="text-xs font-semibold tracking-[3px] text-accent uppercase mb-3">Web Purchase</p>
          <h1 className="text-4xl font-bold mb-3 leading-tight">ProxySocket Pro</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Pay with Naira or crypto. Get a license key instantly.<br />
            Enter it in the app to unlock premium access.
          </p>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {FEATURES.map(f => (
            <span key={f} className="text-xs text-muted-foreground bg-secondary border border-border rounded-full px-3 py-1">
              ✓ {f}
            </span>
          ))}
        </div>

        {/* ── STEP: Country ── */}
        {step === 'country' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="text-xs text-muted-foreground text-center mb-4">Where are you located?</p>

            {/* Nigeria — highlighted */}
            <button
              onClick={() => handleCountrySelect('Nigeria')}
              className="w-full flex items-center justify-between p-4 mb-3 rounded-xl border border-accent/40 bg-accent/5 hover:bg-accent/10 transition-all cursor-pointer text-left"
            >
              <span className="text-sm font-medium">🇳🇬 Nigeria</span>
              <span className="text-xs font-medium text-accent bg-accent/15 px-3 py-1 rounded-full">Naira + Crypto</span>
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground/50">other countries</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="flex flex-col gap-2">
              {COUNTRIES.map(c => (
                <button
                  key={c}
                  onClick={() => handleCountrySelect(c)}
                  className="w-full p-3.5 rounded-xl border border-border bg-secondary/30 hover:bg-secondary/60 hover:border-border/80 transition-all text-sm text-muted-foreground text-left cursor-pointer"
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP: Plan ── */}
        {step === 'plan' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setStep('country')} className="text-xs text-muted-foreground mb-6 flex items-center gap-1 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0">
              ← Back
            </button>
            <p className="text-xs text-muted-foreground text-center mb-5">Choose a plan</p>

            <div className="flex flex-col gap-3 mb-7">
              {PLANS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlan(p.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer text-left ${
                    plan === p.id
                      ? 'border-accent/50 bg-accent/8'
                      : 'border-border bg-secondary/20 hover:bg-secondary/40'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{p.label}</span>
                      {p.badge && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          p.badge === 'POPULAR'
                            ? 'text-accent bg-accent/15'
                            : 'text-green-400 bg-green-400/15'
                        }`}>{p.badge}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">≈ {p.usd}</span>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${plan === p.id ? 'text-accent' : 'text-foreground'}`}>
                      {country === 'nigeria' ? p.naira : p.usd}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.per}</div>
                  </div>
                </button>
              ))}
            </div>

            {country === 'other' && (
              <div className="p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 mb-5 text-sm text-muted-foreground leading-relaxed">
                ⚠️ Crypto payment coming soon for international users. Contact{' '}
                <a href="mailto:hello@deniyitunji.com" className="text-accent">hello@deniyitunji.com</a> for early access.
              </div>
            )}

            {country === 'nigeria' && (
              <button
                onClick={() => setStep('details')}
                className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity cursor-pointer border-none"
              >
                Continue →
              </button>
            )}
          </div>
        )}

        {/* ── STEP: Details ── */}
        {step === 'details' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setStep('plan')} className="text-xs text-muted-foreground mb-6 flex items-center gap-1 hover:text-foreground transition-colors bg-transparent border-none cursor-pointer p-0">
              ← Back
            </button>

            {/* Order summary */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-accent/20 bg-accent/5 mb-7">
              <span className="text-sm text-muted-foreground">ProxySocket {plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
              <span className="text-base font-semibold text-accent">{selectedPlan.naira}</span>
            </div>

            <p className="text-xs text-muted-foreground mb-5">Your details (no account needed)</p>

            <div className="flex flex-col gap-3 mb-6">
              <div className="flex gap-3">
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder="First name *"
                  className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                />
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
                />
              </div>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                placeholder="Email address *"
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
              />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
                placeholder="Phone number * (e.g. 08012345678)"
                className="w-full px-4 py-3.5 rounded-xl border border-border bg-input text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-accent/50 transition-colors"
              />
            </div>

            {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full py-4 rounded-xl bg-accent text-accent-foreground font-semibold text-base hover:opacity-90 transition-opacity cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Pay {selectedPlan.naira} →
            </button>

            <p className="text-center text-xs text-muted-foreground/50 mt-4">
              Redirects to Pocketfi's secure payment page
            </p>
          </div>
        )}

        {/* ── STEP: Processing ── */}
        {step === 'processing' && (
          <div className="text-center py-16 animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-full border-2 border-accent/20 border-t-accent animate-spin mx-auto mb-6" />
            <p className="text-base text-muted-foreground">Redirecting to payment...</p>
            <p className="text-xs text-muted-foreground/40 mt-2">Please wait</p>
          </div>
        )}

        {/* Redeem key section */}
        {(step === 'country' || step === 'plan') && (
          <div className="mt-12 p-5 rounded-xl border border-border bg-secondary/20 text-center">
            <p className="text-xs text-muted-foreground mb-1">Already paid?</p>
            <Link href="/proxysocket/redeem" className="text-sm text-accent hover:underline">
              Redeem your license key →
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
