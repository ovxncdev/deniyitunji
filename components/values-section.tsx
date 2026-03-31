import { Users, Shield, Heart } from "lucide-react"

const values = [
  {
    icon: Users,
    title: "Customer-First",
    description: "We build what people need, not what we think is cool",
  },
  {
    icon: Shield,
    title: "Quality Over Speed",
    description: "We ship when it's ready, not when it's rushed",
  },
  {
    icon: Heart,
    title: "Opportunity Creation",
    description: "We build products AND create jobs for underrepresented talent",
  },
]

export function ValuesSection() {
  return (
    <section id="values" className="py-24 px-6 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Our Values
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            The principles that guide everything we build.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {values.map((value) => (
            <div
              key={value.title}
              className="p-8 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <value.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
