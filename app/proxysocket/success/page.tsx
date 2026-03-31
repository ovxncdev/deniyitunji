'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SuccessPage() {
  const params = useSearchParams()
  const ref = params.get('reference') || params.get('ref') || params.get('payment_id') || ''
  const [licenseKey, setLicenseKey] = useState('')
  const [plan, setPlan] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [attempts, setAttempts] = useState(0)

  useEffect(() => {
    if (!ref) {
      setError('No payment reference found. Please contact support.')
      setLoading(false)
      return
    }

    const poll = async () => {
      try {
        const res = await fetch(`/api/payment/status?ref=${encodeURIComponent(ref)}`)
        const data = await res.json()

        if (data.licenseKey) {
          setLicenseKey(data.licenseKey)
          setPlan(data.plan)
          setLoading(false)
        } else if (attempts < 12) {
          setTimeout(() => setAttempts(a => a + 1), 5000)
        } else {
          setError(`Payment is processing. Contact hello@deniyitunji.com with reference: ${ref}`)
          setLoading(false)
        }
      } catch {
        setAttempts(a => a + 1)
      }
    }

    poll()
  }, [ref, attempts])

  const copy = () => {
    navigator.clipboard.writeText(licenseKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    'Open the ProxySocket app',
    'Tap "I have a license key"',
    'Paste your key above',
    "Tap Activate — you're in!",
  ]

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* Nav */}
      <nav className="flex items-center px-6 py-4 border-b border-border">
        <Link href="/proxysocket" className="flex items-center gap-2.5 no-underline">
          <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-base">🛡</div>
          <span className="font-bold text-lg text-foreground">ProxySocket</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[440px] text-center">

          {/* Loading */}
          {loading && (
            <div className="animate-in fade-in duration-300">
              <div className="w-12 h-12 rounded-full border-2 border-green-400/20 border-t-green-400 animate-spin mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-2">Confirming payment...</h2>
              <p className="text-sm text-muted-foreground">Generating your license key. This takes a few seconds.</p>
            </div>
          )}

          {/* Success */}
          {!loading && licenseKey && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-5xl mb-5">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Payment confirmed!</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Your {plan} license key is ready. Copy it and enter it in the ProxySocket app.
              </p>

              {/* License key */}
              <div className="p-5 rounded-2xl border border-green-400/30 bg-green-400/5 mb-4 text-left">
                <p className="text-xs text-muted-foreground/60 tracking-widest uppercase mb-3">Your license key</p>
                <p className="font-mono text-xl font-semibold tracking-widest text-green-400 mb-4 text-center">{licenseKey}</p>
                <button
                  onClick={copy}
                  className={`w-full py-2.5 rounded-xl border text-sm font-medium transition-all cursor-pointer ${
                    copied
                      ? 'border-green-400/40 bg-green-400/15 text-green-400'
                      : 'border-border bg-secondary/40 text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  }`}
                >
                  {copied ? '✓ Copied!' : 'Copy key'}
                </button>
              </div>

              {/* How to activate */}
              <div className="p-5 rounded-2xl border border-border bg-secondary/20 mb-6 text-left">
                <p className="text-sm font-semibold mb-4 text-foreground/70">How to activate:</p>
                {steps.map((s, i) => (
                  <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
                    <span className="w-5 h-5 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground flex-shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-muted-foreground leading-relaxed">{s}</span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground/40">
                Keep this key safe. Need help?{' '}
                <a href="mailto:hello@deniyitunji.com" className="text-accent">hello@deniyitunji.com</a>
              </p>
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="animate-in fade-in duration-300">
              <div className="text-5xl mb-5">⚠️</div>
              <h2 className="text-2xl font-bold mb-3">Still processing</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
