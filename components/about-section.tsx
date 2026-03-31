const stats = [
  { label: "Founded", value: "2026" },
  { label: "Products Shipped", value: "2" },
  { label: "Users Served", value: "500+" },
  { label: "Team", value: "Growing" },
]

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 bg-secondary/30 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Built by People Who Care
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                DeniyiTunji Inc. is a Black-Canadian technology company founded by 
                Ridwan Adeniyi Adetunji, an MSc Applied Computing student at Wilfrid 
                Laurier University.
              </p>
              <p>
                We believe great products come from understanding real problems. 
                {"That's"} why we conduct extensive customer research before writing 
                a single line of code. Our products are built through systematic 
                validation, not assumptions.
              </p>
              <p>
                {"We're"} committed to creating opportunities for underrepresented 
                talent in tech while building software that makes a difference.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-xl bg-card border border-border text-center"
              >
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
