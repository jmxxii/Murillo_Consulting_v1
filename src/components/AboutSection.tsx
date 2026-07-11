import { Shield, Lightbulb, TrendingUp } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
          <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-4">
            Who We Are
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-5 md:mb-6">
            One Firm. Two Divisions. One Mission.
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Murillo Consulting, LLC is an energy and sustainability consultancy built
            to serve clients at every scale — from large government agencies and utilities
            navigating complex energy transitions, to municipalities, hotels, and
            multifamily communities implementing practical energy solutions. We bring
            deep industry expertise, systems-level thinking, and a commitment to
            measurable outcomes wherever you operate.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {[
            {
              icon: Shield,
              title: "Trusted Expertise",
              description:
                "Decades of combined experience at the intersection of energy policy, utility operations, sustainability strategy, and property-level implementation.",
            },
            {
              icon: Lightbulb,
              title: "Systems Thinking",
              description:
                "We approach every engagement holistically — understanding how technology, regulation, operations, and community needs interconnect.",
            },
            {
              icon: TrendingUp,
              title: "Measurable Impact",
              description:
                "Our work is grounded in data-driven analysis and delivers quantifiable outcomes — whether for an institution or a single property.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface p-6 md:p-8 rounded-lg border border-border"
            >
              <div className="w-11 h-11 md:w-12 md:h-12 rounded-md bg-secondary/10 flex items-center justify-center mb-4 md:mb-5">
                <item.icon className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
              </div>
              <h3 className="text-base md:text-lg font-display font-semibold text-foreground mb-2 md:mb-3">
                {item.title}
              </h3>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
