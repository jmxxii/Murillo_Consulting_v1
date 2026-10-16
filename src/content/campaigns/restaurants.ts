import type { Campaign } from "./types";

/**
 * EXAMPLE CAMPAIGN — restaurants and food service.
 *
 * Status is `draft` on purpose: draft campaigns render in development so a
 * marketer can preview them, and 404 in production. Flip `status` to
 * `"active"` (and set the dates) once the business has signed off on the
 * copy.
 *
 * Copy it as the starting point for a new campaign:
 *   1. cp restaurants.ts <new-slug>.ts
 *   2. edit name/slug/copy
 *   3. register it in ./index.ts
 * No component work is required.
 *
 * Note: `testimonials` is intentionally absent. Do not add one until a real
 * client has agreed in writing to be quoted.
 */
const restaurantsCampaign: Campaign = {
  name: "Restaurants & Food Service",
  slug: "restaurants",
  status: "draft",
  attribution: "restaurants",

  audience: {
    en: "For restaurants and food service",
    es: "Para restaurantes y servicios de comida",
  },

  hero: {
    eyebrow: {
      en: "Energy costs for restaurants",
      es: "Costos de energía para restaurantes",
    },
    headline: {
      en: "Your kitchen runs all day. Your energy rate should work just as hard.",
      es: "Tu cocina trabaja todo el día. Tu tarifa de energía debería trabajar igual.",
    },
    supporting: {
      en: "Restaurants use electricity and natural gas around the clock. Murillo Consulting reviews your recent bills, compares the options available to your accounts, and explains what could change — in plain language.",
      es: "Los restaurantes usan electricidad y gas natural a todas horas. Murillo Consulting revisa tus facturas recientes, compara las opciones disponibles para tus cuentas y te explica qué podría cambiar, en palabras claras.",
    },
    primaryCta: {
      en: "Submit Your Bills",
      es: "Envía tus facturas",
    },
    secondaryCta: {
      en: "See How It Works",
      es: "Conoce el proceso",
    },
  },

  seo: {
    title: {
      en: "Energy Rate Review for Restaurants | Murillo Consulting, LLC",
      es: "Revisión de tarifas de energía para restaurantes | Murillo Consulting, LLC",
    },
    description: {
      en: "Murillo Consulting helps restaurants compare electricity and natural gas options, identify potential savings, and understand their energy choices. Analysis in 3 to 4 business days.",
      es: "Murillo Consulting ayuda a los restaurantes a comparar opciones de electricidad y gas natural, identificar posibles ahorros y entender sus opciones de energía. Análisis en 3 a 4 días hábiles.",
    },
  },

  benefits: {
    heading: {
      en: "Built around how restaurants actually use energy",
      es: "Pensado para cómo los restaurantes realmente usan la energía",
    },
    body: {
      en: "Long hours, refrigeration that never stops, and gas equipment on the line. We look at all of it before we compare anything.",
      es: "Horarios largos, refrigeración que nunca se detiene y equipo de gas en la línea. Revisamos todo eso antes de comparar nada.",
    },
    items: {
      en: [
        {
          title: "Electricity and gas together",
          body: "Most restaurants pay for both. We review both so you see the whole picture, not half of it.",
        },
        {
          title: "Built for long operating hours",
          body: "Your usage pattern is not a nine-to-five office. That pattern matters when comparing rate options.",
        },
        {
          title: "More than one location",
          body: "If you run several locations, we can review the accounts together and explain the differences.",
        },
        {
          title: "Guidance in English and Spanish",
          body: "Work with us in the language your team is most comfortable with.",
        },
      ],
      es: [
        {
          title: "Electricidad y gas juntos",
          body: "La mayoría de los restaurantes pagan ambos. Revisamos los dos para que veas el panorama completo, no la mitad.",
        },
        {
          title: "Pensado para horarios largos",
          body: "Tu patrón de consumo no es el de una oficina de nueve a cinco. Ese patrón importa al comparar opciones de tarifa.",
        },
        {
          title: "Más de una ubicación",
          body: "Si tienes varias ubicaciones, podemos revisar las cuentas juntas y explicarte las diferencias.",
        },
        {
          title: "Asesoría en inglés y español",
          body: "Trabaja con nosotros en el idioma en el que tu equipo se sienta más cómodo.",
        },
      ],
    },
  },

  process: {
    heading: {
      en: "A simple three-step process",
      es: "Un proceso sencillo de tres pasos",
    },
    intro: {
      en: "The same process we use with every business — nothing extra for you to prepare.",
      es: "El mismo proceso que usamos con todos los negocios, sin nada extra que tengas que preparar.",
    },
    steps: {
      en: [
        {
          title: "Share your recent bills",
          body: "Send your most recent electricity and/or natural gas bills for each location you want reviewed.",
        },
        {
          title: "Receive your analysis",
          body: "We review your information and compare applicable options. The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
        },
        {
          title: "Review your opportunities",
          body: "We explain available rate options, potential savings, personalized recommendations, and suggested next steps in clear language.",
        },
      ],
      es: [
        {
          title: "Comparte tus facturas recientes",
          body: "Envía tus facturas más recientes de electricidad y/o gas natural de cada ubicación que quieras que revisemos.",
        },
        {
          title: "Recibe tu análisis",
          body: "Revisamos tu información y comparamos las opciones aplicables. El análisis inicial generalmente se completa dentro de 3 a 4 días hábiles después de recibir toda la información necesaria.",
        },
        {
          title: "Conoce tus oportunidades",
          body: "Te explicamos las opciones de tarifas disponibles, los posibles ahorros, las recomendaciones personalizadas y los próximos pasos de manera clara.",
        },
      ],
    },
    cta: {
      en: "Start Your Analysis",
      es: "Comienza tu análisis",
    },
  },

  services: {
    heading: {
      en: "What we review",
      es: "Qué revisamos",
    },
    items: {
      en: [
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
      ],
      es: [
        {
          title: "Análisis de tarifas de energía",
          body: "Revisamos tus costos actuales de electricidad y gas natural y comparamos las opciones de tarifas aplicables para tu negocio.",
        },
        {
          title: "Oportunidades de compra en grupo",
          body: "Cuando es conveniente, Murillo Consulting reúne varios negocios para buscar precios más competitivos mediante un mayor volumen de compra.",
        },
        {
          title: "Asesoría en eficiencia energética",
          body: "Ayudamos a identificar oportunidades prácticas para reducir el consumo innecesario de energía, controlar costos y operar de manera más eficiente.",
        },
      ],
    },
  },

  faq: {
    heading: {
      en: "Questions restaurant owners ask",
      es: "Preguntas que hacen los dueños de restaurantes",
    },
    items: {
      en: [
        {
          question: "Will my service be interrupted while you review?",
          answer:
            "No. Your electricity and natural gas continue to be delivered through the same established utility infrastructure, with the same expected reliability. Reviewing your options does not touch your physical service.",
        },
        {
          question: "I have several locations. Can you review them together?",
          answer:
            "Yes. Send the most recent bills for each account you would like reviewed and tell us how many locations you operate.",
        },
        {
          question: "How long does it take?",
          answer:
            "The initial analysis is generally completed within 3 to 4 business days after all required information is received.",
        },
        {
          question: "Are savings guaranteed?",
          answer:
            "No. We do not guarantee savings. We identify the options that may be available to your business and explain the potential benefits and considerations of each.",
        },
      ],
      es: [
        {
          question: "¿Se va a interrumpir mi servicio mientras hacen la revisión?",
          answer:
            "No. Tu electricidad y gas natural continúan llegando a través de la misma infraestructura establecida de la compañía de servicios públicos, con la misma confiabilidad esperada. Revisar tus opciones no afecta tu servicio físico.",
        },
        {
          question: "Tengo varias ubicaciones. ¿Pueden revisarlas juntas?",
          answer:
            "Sí. Envía las facturas más recientes de cada cuenta que quieras que revisemos y dinos cuántas ubicaciones tienes.",
        },
        {
          question: "¿Cuánto tarda?",
          answer:
            "El análisis inicial generalmente se completa dentro de 3 a 4 días hábiles después de recibir toda la información necesaria.",
        },
        {
          question: "¿Los ahorros están garantizados?",
          answer:
            "No. No garantizamos ahorros. Identificamos las opciones que podrían estar disponibles para tu negocio y te explicamos los posibles beneficios y consideraciones de cada una.",
        },
      ],
    },
  },

  form: {
    heading: {
      en: "Send your restaurant's bills",
      es: "Envía las facturas de tu restaurante",
    },
    intro: {
      en: "Share your most recent electricity and/or natural gas bills and Murillo Consulting will begin the review.",
      es: "Comparte tus facturas más recientes de electricidad y/o gas natural y Murillo Consulting comenzará la revisión.",
    },
  },
};

export default restaurantsCampaign;
