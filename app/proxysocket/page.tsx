import Link from 'next/link'
import { ArrowRight, Shield, Zap, Globe, Lock, Smartphone, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const features = [
  { icon: Shield, title: 'Kill Switch', desc: 'Traffic blocked instantly if VPN drops — your IP stays hidden' },
  { icon: Globe, title: '9proxy Integration', desc: 'Built-in residential proxy provider with 170+ countries' },
  { icon: Zap, title: 'Fast Connection', desc: 'Userspace engine built for speed on mobile networks' },
  { icon: Lock, title: 'Custom Proxy', desc: 'Connect any SOCKS5, HTTP or V2Ray proxy you already own' },
  { icon: RefreshCw, title: 'Auto-reconnect', desc: 'Seamless reconnect when switching between WiFi and cellular' },
  { icon: Smartphone, title: 'iOS & Android', desc: 'Native apps built for both platforms, not a web wrapper' },
]

const plans = [
  { label: 'Weekly', naira: '₦1,500', usd: '$0.99', per: '/week', popular: false, save: '' },
  { label: 'Monthly', naira: '₦5,000', usd: '$1.99', per: '/month', popular: true, save: '' },
  { label: 'Yearly', naira: '₦45,000', usd: '$9.99', per: '/year', popular: false, save: 'Save 25%' },
]

export default function ProxySocketLandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* Nav */}
      <nav className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-accent/20 flex items-center justify-center text-base">🛡</div>
            <span className="font-bold text-lg text-foreground">ProxySocket</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:block">← DeniyiTunji</Link>
            <Link href="/proxysocket/pay">
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <Badge variant="secondary" className="mb-6">Available on iOS & Android</Badge>
        <h1 className="text-4xl sm:text-6xl font-bold leading-tight mb-6">
          Proxy technology<br />
          <span className="text-accent">built for mobile</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Secure, fast proxy client for iOS and Android. Connect through residential proxies, custom SOCKS5/HTTP servers, or V2Ray — all in one app.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/proxysocket/pay">
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
              Get Pro Access <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">Download Free</Button>
          </a>
        </div>
        <p className="text-xs text-muted-foreground/50 mt-4">Free download · Pro features from ₦1,500/week</p>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Everything you need</h2>
          <p className="text-muted-foreground text-sm">Built after 20+ users requested a proper mobile proxy client</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="p-5 rounded-2xl border border-border bg-card hover:border-accent/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Simple pricing</h2>
          <p className="text-sm text-muted-foreground">Pay with Naira · No account needed · License key delivered instantly</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {plans.map(p => (
            <div key={p.label} className={`p-6 rounded-2xl border flex flex-col ${p.popular ? 'border-accent/50 bg-accent/5' : 'border-border bg-card'}`}>
              {p.popular && <span className="text-[10px] font-semibold text-accent bg-accent/15 px-2.5 py-1 rounded-full self-start mb-4">POPULAR</span>}
              {p.save && <span className="text-[10px] font-semibold text-green-400 bg-green-400/15 px-2.5 py-1 rounded-full self-start mb-4">{p.save}</span>}
              {!p.popular && !p.save && <div className="mb-4 h-6" />}
              <h3 className="font-semibold text-lg mb-1">{p.label}</h3>
              <div className="mb-1">
                <span className="text-2xl font-bold">{p.naira}</span>
                <span className="text-sm text-muted-foreground">{p.per}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-6">≈ {p.usd}{p.per}</p>
              <Link href="/proxysocket/pay" className="mt-auto">
                <Button className={`w-full ${p.popular ? 'bg-accent text-accent-foreground hover:bg-accent/90' : ''}`} variant={p.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-8">
          International users · Crypto payments coming soon ·{' '}
          <a href="mailto:hello@deniyitunji.com" className="text-accent">Contact us</a>
        </p>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-border">
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to get started?</h2>
          <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">Download free on iOS and Android. Upgrade to Pro anytime with a license key.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="https://apps.apple.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">📱 App Store</Button>
            </a>
            <a href="https://play.google.com" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">🤖 Google Play</Button>
            </a>
            <Link href="/proxysocket/pay">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full sm:w-auto">
                Buy License Key <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground/50">
          © 2026 DeniyiTunji Inc. · <Link href="/" className="hover:text-muted-foreground transition-colors">Home</Link> · <a href="mailto:hello@deniyitunji.com" className="hover:text-muted-foreground transition-colors">Support</a>
        </p>
      </footer>
    </div>
  )
}
