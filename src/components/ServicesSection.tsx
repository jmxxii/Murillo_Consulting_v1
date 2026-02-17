import { Zap, BarChart3, Settings, FileCheck } from "lucide-react";

const services = [
  {
    icon: Zap,
    title: "Energy Strategy & Advisory",
    description:
      "Strategic guidance on clean energy transitions, resource planning, and portfolio optimization for utilities and government entities.",
  },
  {
    icon: BarChart3,
    title: "Sustainability Program Management",
    description:
      "End-to-end management of sustainability initiatives — from goal-setting and stakeholder alignment to execution and reporting.",
  },
  {
    icon: Settings,
    title: "Implementation & Integration Support",
    description:
      "Hands-on support for deploying energy technologies, modernizing grid infrastructure, and integrating renewable energy systems.",
  },
  {
    icon: FileCheck,
    title: "Regulatory & Compliance Advisory",
    description:
      "Navigate evolving energy regulations, compliance requirements, and policy frameworks with confidence and clarity.",
  },
];

const ServicesSection = () => {
  return (
    <section id="services" className="py-24 bg-surface">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
            What We Do
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            Comprehensive Energy &amp; Sustainability Services
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We provide strategic advisory and hands-on implementation support
            across the energy value chain.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-background p-8 rounded-lg border border-border flex gap-5"
            >
              <div className="w-11 h-11 rounded-md bg-accent/10 flex items-center justify-center shrink-0 mt-1">
                <service.icon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-lg font-display font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
