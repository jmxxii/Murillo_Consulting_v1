import { Building2, MapPin, ArrowRight } from "lucide-react";

const divisions = [
  {
    icon: Building2,
    label: "Division I",
    title: "Energy & Sustainability Solutions",
    audience: "For government agencies, utilities & large energy organizations",
    description:
      "Strategic advisory and program management for institutions navigating the complexities of large-scale energy transition. We work alongside utilities, state and federal agencies, and major energy organizations to develop policy, plan resources, and execute enterprise-grade sustainability programs.",
    highlights: [
      "Clean energy strategy & resource planning",
      "Sustainability program management",
      "Grid modernization & renewable integration",
      "Regulatory & compliance advisory",
    ],
    anchor: "#services-enterprise",
    accentClass: "bg-primary/10 text-primary border-primary/20",
    badgeClass: "bg-primary/10 text-primary",
  },
  {
    icon: MapPin,
    label: "Division II",
    title: "Community & Property Energy Consulting",
    audience: "For municipalities, hotels, multifamily & local communities",
    description:
      "Practical, implementation-focused consulting for property owners, local governments, and community organizations. We help clients cut costs, meet sustainability goals, and deploy energy programs that work at the operational level — from EV charging to procurement to efficiency retrofits.",
    highlights: [
      "Municipal energy programs & procurement",
      "EV charging program development",
      "Hotel & multifamily energy efficiency",
      "Community energy & sustainability planning",
    ],
    anchor: "#services-community",
    accentClass: "bg-secondary/10 text-secondary border-secondary/20",
    badgeClass: "bg-secondary/10 text-secondary",
  },
];

const DivisionsSection = () => {
  return (
    <section id="divisions" className="py-16 md:py-24 bg-surface">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
          <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-4">
            Our Divisions
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-5 md:mb-6">
            Built for Enterprise. Ready for Main Street.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Murillo Consulting operates through two focused divisions — each tailored
            to the unique demands of the clients it serves, unified by the same standard
            of expertise and accountability.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 md:gap-8 max-w-6xl mx-auto">
          {divisions.map((division) => (
            <div
              key={division.title}
              className="bg-background rounded-xl border border-border p-6 sm:p-8 md:p-10 flex flex-col"
            >
              {/* Division badge */}
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className={`w-10 h-10 md:w-11 md:h-11 rounded-md flex items-center justify-center border shrink-0 ${division.accentClass}`}>
                  <division.icon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className={`text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full ${division.badgeClass}`}>
                  {division.label}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl md:text-2xl font-display font-bold text-foreground mb-2">
                {division.title}
              </h3>
              <p className="text-sm font-medium text-muted-foreground mb-4 md:mb-5">
                {division.audience}
              </p>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-6 md:mb-8">
                {division.description}
              </p>

              {/* Highlights */}
              <ul className="space-y-2 mb-6 md:mb-8">
                {division.highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-auto">
                <a
                  href={division.anchor}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-secondary hover:text-accent transition-colors"
                >
                  View Services
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DivisionsSection;
