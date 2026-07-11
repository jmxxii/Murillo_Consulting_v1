import { Zap, BarChart3, Settings, FileCheck, MapPin, Car, Building, Leaf } from "lucide-react";

const enterpriseServices = [
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

const communityServices = [
  {
    icon: MapPin,
    title: "Municipal Energy Programs & Procurement",
    description:
      "Support for local governments managing energy procurement, aggregation programs, and municipal sustainability initiatives.",
  },
  {
    icon: Car,
    title: "EV Charging Program Development",
    description:
      "Site assessment, vendor selection, incentive program navigation, and deployment support for EV charging infrastructure.",
  },
  {
    icon: Building,
    title: "Hotel & Multifamily Energy Efficiency",
    description:
      "Energy audits, retrofit planning, and efficiency program management tailored to the operational realities of hospitality and residential properties.",
  },
  {
    icon: Leaf,
    title: "Community Energy & Sustainability Planning",
    description:
      "Local energy strategy, community solar facilitation, and sustainability roadmaps for neighborhoods, districts, and regional programs.",
  },
];

interface ServiceCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

const ServiceCard = ({ icon: Icon, title, description }: ServiceCardProps) => (
  <div className="bg-background p-5 sm:p-6 md:p-8 rounded-lg border border-border flex gap-4 md:gap-5">
    <div className="w-10 h-10 md:w-11 md:h-11 rounded-md bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
      <Icon className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
    </div>
    <div>
      <h3 className="text-base md:text-lg font-display font-semibold text-foreground mb-1.5 md:mb-2">
        {title}
      </h3>
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </div>
  </div>
);

interface DivisionDividerProps {
  label: string;
  colorClass: string;
}

const DivisionDivider = ({ label, colorClass }: DivisionDividerProps) => (
  <div className="flex flex-col sm:flex-row items-center gap-3 mb-6 md:mb-8">
    {/* Decorative lines — hidden on mobile to prevent overflow */}
    <div className="hidden sm:block h-px flex-1 bg-border" />
    <span className={`shrink-0 text-[11px] font-bold tracking-wider uppercase px-4 py-1.5 rounded-full text-center ${colorClass}`}>
      {label}
    </span>
    <div className="hidden sm:block h-px flex-1 bg-border" />
  </div>
);

const ServicesSection = () => {
  return (
    <section id="services" className="py-16 md:py-24 bg-surface">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-10 md:mb-16">
          <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-4">
            What We Do
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-5 md:mb-6">
            Services Across Both Divisions
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
            Whether you're navigating large-scale energy policy or looking to reduce
            costs at the property level, we bring the right expertise to the table.
          </p>
        </div>

        {/* Division I */}
        <div id="services-enterprise" className="max-w-5xl mx-auto mb-12 md:mb-16">
          <DivisionDivider
            label="Division I — Energy & Sustainability Solutions"
            colorClass="text-primary bg-primary/10"
          />
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {enterpriseServices.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>

        {/* Division II */}
        <div id="services-community" className="max-w-5xl mx-auto">
          <DivisionDivider
            label="Division II — Community & Property Energy Consulting"
            colorClass="text-secondary bg-secondary/10"
          />
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {communityServices.map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
