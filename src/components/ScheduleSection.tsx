import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const ScheduleSection = () => {
  return (
    <section id="schedule" className="py-24 bg-primary">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
            Get Started
          </p>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-6">
            Schedule a Consultation
          </h2>
          <p className="text-lg text-primary-foreground/70 leading-relaxed mb-10">
            Ready to discuss your energy and sustainability goals? Book a meeting
            with our team directly through Microsoft Teams.
          </p>

          {/* Microsoft Teams scheduling placeholder */}
          <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg p-12 mb-8">
            <Calendar className="w-12 h-12 text-primary-foreground/50 mx-auto mb-4" />
            <p className="text-primary-foreground/60 text-sm font-medium mb-2">
              Microsoft Teams Scheduling Widget
            </p>
            <p className="text-primary-foreground/40 text-xs max-w-md mx-auto">
              Embed your Microsoft Teams booking page here. Replace this
              placeholder with your scheduling script or iframe embed code.
            </p>
          </div>

          <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
            <a href="mailto:contact@murilloconsulting.com">
              Or Contact Us Directly
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
