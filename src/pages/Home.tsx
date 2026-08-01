import { useMemo } from "react";
import HeroSection from "@/components/sections/HeroSection";
import ReliabilitySection from "@/components/sections/ReliabilitySection";
import ProcessSection from "@/components/sections/ProcessSection";
import ServicesSection from "@/components/sections/ServicesSection";
import WhyUsSection from "@/components/sections/WhyUsSection";
import IndustriesSection from "@/components/sections/IndustriesSection";
import BillCtaSection from "@/components/sections/BillCtaSection";
import AboutSection from "@/components/sections/AboutSection";
import FaqSection from "@/components/sections/FaqSection";
import ContactSection from "@/components/sections/ContactSection";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";
import { useLanguage } from "@/i18n/LanguageProvider";
import { homeGraph } from "@/lib/structuredData";

/**
 * Homepage.
 *
 * Section order follows the conversion path: what we do -> reassurance ->
 * how it works -> what we offer -> why us -> who we serve -> submit ->
 * who you'll work with -> objections -> contact.
 */
const Home = () => {
  const { t, locale } = useLanguage();
  const structuredData = useMemo(() => homeGraph(locale, t), [locale, t]);

  useDocumentMeta({
    title: t.seo.homeTitle,
    description: t.seo.homeDescription,
    path: "/",
    locale,
    structuredData,
  });

  return (
    <>
      <HeroSection />
      <ReliabilitySection />
      <ProcessSection />
      <ServicesSection />
      <WhyUsSection />
      <IndustriesSection />
      <BillCtaSection />
      <AboutSection />
      <FaqSection />
      <ContactSection />
    </>
  );
};

export default Home;
