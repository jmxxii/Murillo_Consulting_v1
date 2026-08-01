/**
 * English dictionary — the CANONICAL shape of all customer-facing copy.
 *
 * `Dictionary` is derived from this object (`typeof en`), so every other
 * locale file is type-checked against it. Adding a key here without adding
 * it to es.ts is a compile error, which is how we guarantee translation
 * parity without a runtime check.
 *
 * Rules for editing:
 *  - No copy anywhere else in the app. Components read from here only.
 *  - Keep tuples/arrays the same length across locales.
 *  - Never state guaranteed savings. Use "potential", "available", "may".
 */
const en = {
  meta: {
    localeName: "English",
    localeNativeName: "English",
    htmlLang: "en",
    ogLocale: "en_US",
  },

  common: {
    companyName: "Murillo Consulting, LLC",
    companyShortName: "Murillo Consulting",
    skipToContent: "Skip to main content",
    backToHome: "Back to home",
    loading: "Loading…",
    required: "Required",
    optional: "Optional",
  },

  nav: {
    ariaLabel: "Main navigation",
    mobileMenuLabel: "Open navigation menu",
    mobileMenuTitle: "Menu",
    closeMenu: "Close menu",
    home: "Home",
    howItWorks: "How It Works",
    services: "Services",
    about: "About",
    faq: "FAQ",
    contact: "Contact",
    primaryCta: "Start Your Analysis",
    languageLabel: "Language",
    languageSwitcherAria: "Select a language",
  },

  hero: {
    eyebrow: "Energy consulting for business owners",
    headline: "Better energy rates for your business, made simple.",
    supporting:
      "Murillo Consulting, LLC helps businesses compare electricity and natural gas options, identify potential savings, and make informed decisions with personalized guidance.",
    primaryCta: "Start Your Analysis",
    secondaryCta: "See How It Works",
    imageAlt: "Business owner reviewing energy bills",
    highlights: [
      "Electricity and natural gas",
      "Analysis in 3–4 business days",
      "Service in English and Spanish",
    ] as const,
  },

  reliability: {
    eyebrow: "Your service stays reliable",
    heading: "Comparing your options does not interrupt your service",
    body: "Your electricity or natural gas continues to be delivered through the same established utility infrastructure, with the same expected reliability. Murillo Consulting focuses on helping you evaluate available pricing and supply options.",
    points: [
      {
        title: "Your utility keeps delivering your energy",
        body: "The utility company remains responsible for the lines, pipes, meters, outages, and physical delivery to your business. That does not change.",
      },
      {
        title: "What we review is the pricing and supply side",
        body: "We look at the rate and supply options available to your account, which is a separate part of your bill from delivery.",
      },
      {
        title: "You decide what happens next",
        body: "We explain what we found in plain language. Nothing moves forward unless you choose to move forward.",
      },
    ] as const,
  },

  process: {
    eyebrow: "How it works",
    heading: "A simple three-step process",
    intro:
      "Most of the work is on our side. Here is everything we need from you.",
    stepLabel: "Step",
    steps: [
      {
        title: "Share your recent bills",
        body: "Send us your most recent electricity and/or natural gas bills so we can understand your current usage, rates, and account structure.",
      },
      {
        title: "Receive your analysis",
        body: "We review your information and compare applicable options. The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
      },
      {
        title: "Review your opportunities",
        body: "We explain available rate options, potential savings, personalized recommendations, and suggested next steps in clear language.",
      },
    ] as const,
    cta: "Start Your Analysis",
  },

  services: {
    eyebrow: "What we do",
    heading: "Three ways we help your business",
    intro:
      "Practical support for understanding what you pay for energy and what else may be available to you.",
    items: [
      {
        title: "Energy Rate Analysis",
        body: "We review your current electricity and natural gas costs and compare applicable rate options for your business.",
      },
      {
        title: "Group Purchasing Opportunities",
        body: "When appropriate, Murillo Consulting brings multiple businesses together to pursue more competitive pricing through greater purchasing volume.",
      },
      {
        title: "Energy-Efficiency Guidance",
        body: "We help identify practical opportunities to reduce unnecessary energy use, control costs, and operate more efficiently.",
      },
    ] as const,
  },

  whyUs: {
    eyebrow: "Why Murillo Consulting",
    heading: "Personalized guidance, not just a list of rates",
    body: "Energy pricing can be confusing. Murillo Consulting reviews the details, explains the available options, and helps business owners understand the potential benefits and considerations before making a decision.",
    benefits: [
      {
        title: "Clear explanations",
        body: "We translate contract and pricing language into words that actually make sense.",
      },
      {
        title: "Personalized recommendations",
        body: "Guidance based on how your business actually uses energy, not a generic template.",
      },
      {
        title: "Multiple options compared",
        body: "We look at what is available to your account and show you the differences side by side.",
      },
      {
        title: "Support throughout the process",
        body: "You have someone to ask questions before, during, and after you decide.",
      },
      {
        title: "Service in English and Spanish",
        body: "Work with us in the language you are most comfortable with.",
      },
      {
        title: "No unnecessary complexity",
        body: "You share your bills. We do the comparison work and bring you the results.",
      },
    ] as const,
  },

  industries: {
    eyebrow: "Who we work with",
    heading: "Businesses of many kinds",
    intro:
      "Murillo Consulting works with small and midsize businesses across a range of industries. If your business pays an electricity or natural gas bill, we can review it.",
    items: [
      "Restaurants and hospitality",
      "Retail businesses",
      "Offices",
      "Warehouses",
      "Professional-service businesses",
      "Property owners and property managers",
      "Small and midsize commercial operations",
    ] as const,
    note: "This is not a complete list. Reach out and we will let you know how we can help.",
  },

  billCta: {
    eyebrow: "Get started",
    heading: "Ready to explore the options available to your business?",
    body: "Tell us about your business and Murillo Consulting will send you a secure link to share your recent energy bills. The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
    primaryCta: "Start Your Analysis",
    secondaryCta: "Ask a question first",
  },

  about: {
    eyebrow: "Your point of contact",
    heading: "Work directly with Larry Murillo",
    body: "Murillo Consulting provides straightforward, personalized guidance to help business owners understand their energy options. Larry works directly with clients to review their needs, explain available opportunities, and support them throughout the decision-making process.",
    contactName: "Larry Murillo",
    contactRole: "Murillo Consulting, LLC",
    emailLabel: "Email",
    phoneLabel: "Phone",
    scheduleLabel: "Schedule a meeting",
    scheduleCta: "Book a time",
    portraitAlt: "Portrait of Larry Murillo",
  },

  faq: {
    eyebrow: "Questions",
    heading: "Frequently asked questions",
    intro: "Short, direct answers to what business owners ask us most.",
    items: [
      {
        question: "Will my electricity or natural gas service be interrupted?",
        answer:
          "No. Your energy continues to be delivered through the same established utility infrastructure, with the same expected reliability. What we review is the pricing and supply side of your account, not the physical delivery of your service.",
      },
      {
        question: "Do I need to change my utility company?",
        answer:
          "No. The utility company responsible for the lines, meters, outages, and delivery to your business stays the same. Murillo Consulting focuses on helping you evaluate the rate and supply options available to your account.",
      },
      {
        question: "How does the process work?",
        answer:
          "There are three steps. You share your most recent electricity and/or natural gas bills, we review your information and compare applicable options, and then we walk you through what we found and what your next steps could be.",
      },
      {
        question: "What documents do I need?",
        answer:
          "Your most recent electricity and/or natural gas bills. Complete bills are best, since the account details and usage history are what let us compare options accurately.",
      },
      {
        question: "How long does the analysis take?",
        answer:
          "The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
      },
      {
        question: "Are savings guaranteed?",
        answer:
          "No. We do not guarantee savings. We identify the options that may be available to your business and explain the potential benefits and considerations of each so you can make an informed decision.",
      },
      {
        question: "Can Murillo Consulting help businesses with multiple locations?",
        answer:
          "Yes. Tell us how many locations you operate when you get in touch, and the secure link we send you will let you share the bills for each account you would like reviewed.",
      },
      {
        question: "Is service available in Spanish?",
        answer:
          "Yes. Murillo Consulting works with business owners in English and Spanish, and you can use this website in either language.",
      },
      {
        question: "How is Murillo Consulting compensated?",
        answer:
          "Please contact Larry Murillo directly and he will explain how compensation works for your situation.",
      },
    ] as const,
  },

  contact: {
    eyebrow: "Contact",
    heading: "Start your energy review",
    intro:
      "Send your information and your recent bills, or reach out directly if you would rather talk first.",
    directHeading: "Prefer to reach out directly?",
    directBody:
      "You can email or call Murillo Consulting and we will take it from there.",
    responseNote:
      "After you submit, Murillo Consulting reviews your information. The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
  },

  form: {
    heading: "Submit your bills",
    introHeading: "Ready to explore the options available to your business?",
    introBody:
      "Tell us a little about your business and Murillo Consulting will send you a secure link to share your recent energy bills. The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
    sectionContact: "Your contact information",
    sectionBusiness: "About your business",
    sectionNotes: "Anything else",

    firstName: "First name",
    lastName: "Last name",
    businessName: "Business name",
    email: "Email",
    phone: "Phone number",
    preferredLanguage: "Preferred language",
    businessLocation: "Business location",
    businessLocationHelp: "City and state is enough.",
    serviceType: "What would you like reviewed?",
    serviceTypeElectricity: "Electricity",
    serviceTypeGas: "Natural gas",
    serviceTypeBoth: "Both",
    locationCount: "Number of business locations",
    notes: "Additional notes",
    notesPlaceholder:
      "Anything you would like us to know — for example, upcoming contract dates or questions you have.",
    consent:
      "I agree that Murillo Consulting may contact me about my energy options.",
    consentHelp:
      "We use your information only to prepare and discuss your energy analysis.",

    submit: "Start Your Analysis",
    submitting: "Sending…",
    submitAnother: "Submit another business",

    /**
     * Used by the private, link-gated upload page — NOT by the public form.
     * Bills are never collected from an anonymous visitor; Larry emails a
     * single-use link after first contact. See docs/backend-requirements.md.
     */
    upload: {
      label: "Upload your bills",
      dropzone: "Drag your bills here, or",
      browse: "browse your files",
      hint: "PDF, JPG, JPEG or PNG · up to {maxSize} per file · {maxFiles} files max",
      selectedFiles: "Selected files",
      remove: "Remove {name}",
      removed: "File removed",
      progress: "Uploading",
      uploadingLabel: "Upload progress",
      noFiles: "No files selected yet.",
      helpText:
        "Your bills are used only to prepare your analysis and are stored privately.",
    },

    nextSteps: {
      heading: "What happens next",
      items: [
        "We review what you sent and confirm we can help.",
        "Larry emails you a secure, single-use link to share your recent bills.",
        "The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
      ],
      whyNoUpload:
        "We do not ask for bills on this page. Energy bills contain your account number and usage history, so we collect them through a private link sent only to you.",
    },

    errors: {
      firstNameRequired: "Please enter your first name.",
      lastNameRequired: "Please enter your last name.",
      businessNameRequired: "Please enter your business name.",
      emailRequired: "Please enter your email address.",
      emailInvalid: "Please enter a valid email address.",
      phoneRequired: "Please enter a phone number.",
      phoneInvalid: "Please enter a valid phone number.",
      businessLocationRequired: "Please enter your business location.",
      serviceTypeRequired: "Please choose what you would like reviewed.",
      locationCountMin: "Please enter at least 1 location.",
      locationCountMax: "For more than 100 locations, please contact us directly.",
      notesTooLong: "Please keep your notes under 2,000 characters.",
      consentRequired: "Please confirm this so we can contact you.",
      fileTooLarge: "{name} is larger than {maxSize}.",
      fileWrongType: "{name} is not a supported file type. Use PDF, JPG, JPEG or PNG.",
      fileContentMismatch:
        "{name} does not appear to be a valid PDF or image file.",
      tooManyFiles: "You can attach up to {maxFiles} files.",
      fileEmpty: "{name} appears to be empty.",
      summaryTitle: "Please check the following",
    },

    status: {
      successTitle: "Thank you",
      successBody:
        "Thank you. We received your information. Larry Murillo will review it and email you a secure link so you can share your recent energy bills.",
      errorTitle: "We could not send your information",
      errorBody:
        "Something went wrong on our end. Please try again, or contact us directly using the details below.",
      unconfiguredTitle: "Online submission is not available yet",
      unconfiguredBody:
        "This form is not connected to a submission service yet. Please contact Murillo Consulting directly using the details below and we will get started.",
      retry: "Try again",
    },
  },

  footer: {
    tagline:
      "Helping businesses compare electricity and natural gas options and understand their potential savings.",
    navHeading: "Site",
    contactHeading: "Contact",
    legalHeading: "Notice",
    disclaimer:
      "Murillo Consulting, LLC provides energy consulting services. Savings are not guaranteed. Available options depend on your utility, account, and market conditions.",
    rights: "All rights reserved.",
    languageHeading: "Language",
  },

  notFound: {
    title: "Page not found",
    heading: "We could not find that page",
    body: "The page you are looking for may have been moved or no longer exists.",
    cta: "Go to the homepage",
  },

  seo: {
    homeTitle:
      "Murillo Consulting, LLC | Better Energy Rates for Your Business",
    homeDescription:
      "Murillo Consulting helps small and midsize businesses compare electricity and natural gas options, identify potential savings, and make informed decisions with personalized guidance in English and Spanish.",
    notFoundTitle: "Page not found | Murillo Consulting, LLC",
    notFoundDescription:
      "The page you are looking for could not be found. Return to the Murillo Consulting homepage.",
  },
} as const;

export default en;
