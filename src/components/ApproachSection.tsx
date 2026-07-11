import { CheckCircle } from "lucide-react";

const values = [
  "Deep regulatory, policy, and market expertise",
  "Practical, implementation-focused thinking at every scale",
  "Data-driven analysis with measurable, accountable outcomes",
  "Cross-functional expertise spanning energy systems and property operations",
  "Collaborative approach tailored to your stakeholders and constraints",
  "Long-term sustainability built into every engagement",
];

const ApproachSection = () => {
  return (
    <section id="approach" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-start lg:items-center max-w-6xl mx-auto">
          <div>
            <p className="text-secondary font-semibold tracking-widest uppercase text-sm mb-4">
              Our Approach
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-foreground mb-5 md:mb-6">
              Rigorous Thinking. Practical Results.
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              Energy and sustainability challenges don't come in one size. Whether
              we're advising a state agency on a multi-year transition strategy or
              helping a hotel reduce its energy spend, our approach is the same:
              understand the system, engage the stakeholders, and deliver outcomes
              that hold up over time.
            </p>
          </div>

          <div className="bg-surface p-6 sm:p-8 md:p-10 rounded-lg border border-border">
            <h3 className="font-display font-semibold text-foreground mb-5 md:mb-6 text-base md:text-lg">
              What Sets Us Apart
            </h3>
            <ul className="space-y-3 md:space-y-4">
              {values.map((value) => (
                <li key={value} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm md:text-base text-surface-foreground leading-snug">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ApproachSection;
