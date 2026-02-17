import { CheckCircle } from "lucide-react";

const values = [
  "Enterprise-scale reliability and accountability",
  "Deep regulatory and policy awareness",
  "Scalable solutions designed for long-term impact",
  "Data-driven, measurable outcomes",
  "Cross-functional expertise across energy systems",
  "Collaborative approach with stakeholder alignment",
];

const ApproachSection = () => {
  return (
    <section id="approach" className="py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
          <div>
            <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
              Our Approach
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
              Built for the Scale and Complexity of Modern Energy
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We understand that energy and sustainability challenges require more
              than generic consulting. Our approach is rooted in deep technical
              knowledge, regulatory expertise, and a relentless focus on
              delivering results that matter at an institutional scale.
            </p>
          </div>

          <div className="bg-surface p-8 md:p-10 rounded-lg border border-border">
            <h3 className="font-display font-semibold text-foreground mb-6 text-lg">
              What Sets Us Apart
            </h3>
            <ul className="space-y-4">
              {values.map((value) => (
                <li key={value} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                  <span className="text-surface-foreground">{value}</span>
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
