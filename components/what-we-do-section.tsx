import { Search, Target, Sparkles } from "lucide-react"

const pillars = [
  {
    icon: Search,
    title: "Research-Driven",
    description: "We talk to real users before writing code",
  },
  {
    icon: Target,
    title: "Quality-Focused",
    description: "We ship products that solve actual problems",
  },
  {
    icon: Sparkles,
    title: "Impact-Oriented",
    description: "We build opportunities while building products",
  },
]

export function WhatWeDoSection() {
  return (
    <section className="py-24 px-6 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-pretty">
            We validate problems through customer research, build solutions that work, 
            and ship products people love.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col items-center text-center p-8 rounded-xl bg-card border border-border hover:border-accent/50 transition-colors"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-6">
                <pillar.icon className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {pillar.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
