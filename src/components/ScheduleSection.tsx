import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

const ScheduleSection = () => {
  return (
    <section id="schedule" className="py-16 md:py-24 bg-primary">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-4">
            Get Started
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-primary-foreground mb-5 md:mb-6">
            Schedule a Consultation
          </h2>
          <p className="text-base md:text-lg text-primary-foreground/70 leading-relaxed mb-8 md:mb-10">
            Ready to talk through your energy and sustainability goals? Whether
            you're a government agency planning a major initiative or a property
            owner looking to cut costs, we'd like to hear from you. Book a meeting
            directly through Microsoft Teams.
          </p>

          {/* Scheduling box */}
          <div className="bg-primary-foreground/10 border border-primary-foreground/20 rounded-lg p-6 sm:p-8 md:p-12 mb-6 md:mb-8">
            <Calendar className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground/50 mx-auto mb-4" />
            <p className="text-primary-foreground/60 text-sm font-medium mb-2">
              Book Your Consultation
            </p>
            <p className="text-primary-foreground/40 text-xs max-w-sm mx-auto mb-6">
              Use our scheduling tool to find a time that works for your team.
            </p>
            <Button
              variant="hero"
              size="lg"
              className="text-base px-8 py-6 w-full sm:w-auto"
              asChild
            >
              <a href="https://outlook.office.com/book/EnergyStrategy@murilloconsulting.co/?ismsaljsauthenabled=true">
                Schedule Now
              </a>
            </Button>
          </div>

          <div className="mt-6 md:mt-8">
            <p className="text-primary-foreground/60 text-sm mb-4">
              Prefer to reach us directly?
            </p>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-8 py-6 w-full sm:w-auto"
              asChild
            >
              <a href="mailto:contact@murilloconsulting.com">
                Send Us an Email
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
