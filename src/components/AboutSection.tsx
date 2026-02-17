import { Shield, Lightbulb, TrendingUp } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="py-24 bg-background">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
            Who We Are
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            Enterprise-Grade Energy Consulting
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Murillo Consulting partners with government agencies, utilities, and
            large energy organizations to navigate the complexities of the modern
            energy landscape. We bring deep industry expertise, systems-level
            thinking, and a commitment to long-term sustainability outcomes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Shield,
              title: "Trusted Expertise",
              description:
                "Decades of combined experience working at the intersection of energy policy, utility operations, and sustainability strategy.",
            },
            {
              icon: Lightbulb,
              title: "Systems Thinking",
              description:
                "We approach every engagement with a holistic view — understanding how technology, regulation, and operations interconnect.",
            },
            {
              icon: TrendingUp,
              title: "Measurable Impact",
              description:
                "Our work is grounded in data-driven analysis and delivers quantifiable outcomes aligned with your organizational goals.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="bg-surface p-8 rounded-lg border border-border"
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-5">
                <item.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-display font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
