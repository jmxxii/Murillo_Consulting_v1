import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-energy.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Clean energy infrastructure at dawn"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-primary/85" />
      </div>

      <div className="container relative z-10 py-24">
        <div className="max-w-3xl">
          <p className="text-accent font-semibold tracking-widest uppercase text-sm mb-6">
            Energy &amp; Sustainability Consulting
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-primary-foreground leading-tight mb-6">
            Powering the Future of
            <br />
            Sustainable Energy
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/75 leading-relaxed mb-10 max-w-2xl">
            Strategic advisory and implementation support for government agencies,
            utilities, and large-scale energy organizations driving the transition
            to a cleaner, more resilient energy future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="hero" size="lg" className="text-base px-8 py-6" asChild>
              <a href="#schedule">Schedule a Consultation</a>
            </Button>
            <Button variant="heroOutline" size="lg" className="text-base px-8 py-6" asChild>
              <a href="#services">Our Services</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
