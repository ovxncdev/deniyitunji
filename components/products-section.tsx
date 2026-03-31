import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Briefcase, Globe, ArrowRight } from "lucide-react"

const products = [
  {
    icon: Briefcase,
    name: "RiseWork",
    tagline: "Quality over quantity job search",
    description:
      "Gamified platform helping students land their first job. 3 daily applications, AI-powered optimization, streak tracking.",
    metrics: "100+ Beta Users | Launching June 2026",
    status: "Beta",
    statusVariant: "secondary" as const,
    link: "#",
    linkText: "Learn More",
  },
  {
    icon: Globe,
    name: "ProxySocket",
    tagline: "Proxy technology for mobile",
    description:
      "Secure mobile proxy solution for iOS and Android. Built after 20+ users requested it.",
    metrics: "Available on App Store",
    status: "Live",
    statusVariant: "default" as const,
    link: "/proxysocket",
    linkText: "Learn More",
  },
]

export function ProductsSection() {
  return (
    <section id="products" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our Products
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Tools built through customer research and validated demand.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {products.map((product) => (
            <Card
              key={product.name}
              className="group relative overflow-hidden hover:border-accent/50 transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                    <product.icon className="w-6 h-6 text-accent" />
                  </div>
                  <Badge variant={product.statusVariant}>{product.status}</Badge>
                </div>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription className="text-accent font-medium">
                  {product.tagline}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {product.description}
                </p>
                <p className="text-sm text-muted-foreground font-medium">
                  {product.metrics}
                </p>
                <Link
                  href={product.link}
                  className="inline-flex items-center text-sm text-accent hover:text-accent/80 transition-colors font-medium group/link"
                >
                  {product.linkText}
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
