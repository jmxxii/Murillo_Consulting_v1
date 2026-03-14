import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-energy.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Clean energy infrastructure at dawn"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="container relative z-10 py-28 md:py-24 lg:py-32">
        <div className="max-w-3xl">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-5 md:mb-6">
            Murillo Consulting, LLC
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-5 md:mb-6">
            Energy &amp; Sustainability
            <span className="block">Consulting That Scales</span>
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-primary-foreground/75 leading-relaxed mb-8 md:mb-10 max-w-2xl">
            From enterprise energy strategy to community-level implementation —
            Murillo Consulting serves government agencies, utilities, municipalities,
            hotels, and multifamily properties with practical, results-driven consulting.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Button
              variant="hero"
              size="lg"
              className="text-base px-8 py-6 w-full sm:w-auto"
              asChild
            >
              <a href="#schedule">Schedule a Consultation</a>
            </Button>
            <Button
              variant="heroOutline"
              size="lg"
              className="text-base px-8 py-6 w-full sm:w-auto"
              asChild
            >
              <a href="#divisions">Our Divisions</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
