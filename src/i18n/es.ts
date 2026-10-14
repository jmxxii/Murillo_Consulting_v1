import type { Dictionary } from "./types";

/**
 * Spanish dictionary.
 *
 * Typed as `Dictionary`, so TypeScript rejects this file if any key from
 * en.ts is missing or if a list has a different number of items.
 *
 * Voice: informal "tú", the register a small business owner would expect
 * from someone helping them personally. Avoid literal translations of
 * English idiom — say the same thing the way a Spanish speaker would say it.
 */
const es: Dictionary = {
  meta: {
    localeName: "Spanish",
    localeNativeName: "Español",
    htmlLang: "es",
    ogLocale: "es_US",
  },

  common: {
    companyName: "Murillo Consulting, LLC",
    companyShortName: "Murillo Consulting",
    skipToContent: "Ir al contenido principal",
    backToHome: "Volver al inicio",
    loading: "Cargando…",
    required: "Obligatorio",
    optional: "Opcional",
  },

  nav: {
    ariaLabel: "Navegación principal",
    mobileMenuLabel: "Abrir el menú de navegación",
    mobileMenuTitle: "Menú",
    closeMenu: "Cerrar el menú",
    home: "Inicio",
    howItWorks: "Cómo funciona",
    services: "Servicios",
    about: "Nosotros",
    faq: "Preguntas",
    contact: "Contacto",
    primaryCta: "Envía tus facturas",
    languageLabel: "Idioma",
    languageSwitcherAria: "Seleccionar idioma",
  },

  hero: {
    eyebrow: "Asesoría de energía para dueños de negocios",
    headline: "Mejores tarifas de energía para tu negocio, de manera simple.",
    supporting:
      "Murillo Consulting, LLC ayuda a los negocios a comparar opciones de electricidad y gas natural, identificar posibles ahorros y tomar decisiones informadas con asesoría personalizada.",
    primaryCta: "Envía tus facturas",
    secondaryCta: "Conoce el proceso",
    imageAlt: "Dueño de negocio revisando sus facturas de energía",
    highlights: [
      "Electricidad y gas natural",
      "Análisis en 3 a 4 días hábiles",
      "Atención en inglés y español",
    ],
  },

  reliability: {
    eyebrow: "Tu servicio sigue igual de confiable",
    heading: "Comparar tus opciones no interrumpe tu servicio",
    body: "Tu electricidad o gas natural continúa llegando a través de la misma infraestructura establecida de la compañía de servicios públicos, con la misma confiabilidad esperada. Murillo Consulting se enfoca en ayudarte a evaluar las opciones disponibles de precio y suministro.",
    points: [
      {
        title: "Tu compañía de servicios públicos sigue entregando tu energía",
        body: "La compañía de servicios públicos sigue a cargo de las líneas, las tuberías, los medidores, las interrupciones y la entrega física a tu negocio. Eso no cambia.",
      },
      {
        title: "Lo que revisamos es la parte de precio y suministro",
        body: "Revisamos las opciones de tarifa y suministro disponibles para tu cuenta, que es una parte de tu factura distinta a la de entrega.",
      },
      {
        title: "Tú decides qué sigue",
        body: "Te explicamos lo que encontramos en palabras claras. Nada avanza a menos que tú decidas avanzar.",
      },
    ],
  },

  process: {
    eyebrow: "Cómo funciona",
    heading: "Un proceso sencillo de tres pasos",
    intro:
      "La mayor parte del trabajo queda de nuestro lado. Esto es todo lo que necesitamos de ti.",
    stepLabel: "Paso",
    steps: [
      {
        title: "Comparte tus facturas recientes",
        body: "Envíanos tus facturas más recientes de electricidad y/o gas natural para que podamos entender tu consumo, tus tarifas y la estructura de tu cuenta.",
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
    cta: "Comienza tu análisis",
  },

  services: {
    eyebrow: "Qué hacemos",
    heading: "Tres formas en que ayudamos a tu negocio",
    intro:
      "Apoyo práctico para entender lo que pagas por la energía y qué otras opciones podrían estar disponibles para ti.",
    items: [
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

  whyUs: {
    eyebrow: "Por qué Murillo Consulting",
    heading: "Asesoría personalizada, no solo una lista de tarifas",
    body: "Los precios de energía pueden ser confusos. Murillo Consulting revisa los detalles, explica las opciones disponibles y ayuda a los dueños de negocios a entender los posibles beneficios y consideraciones antes de tomar una decisión.",
    benefits: [
      {
        title: "Explicaciones claras",
        body: "Traducimos el lenguaje de contratos y precios a palabras que de verdad se entienden.",
      },
      {
        title: "Recomendaciones personalizadas",
        body: "Asesoría basada en cómo tu negocio realmente usa la energía, no en una plantilla genérica.",
      },
      {
        title: "Varias opciones comparadas",
        body: "Revisamos lo que está disponible para tu cuenta y te mostramos las diferencias lado a lado.",
      },
      {
        title: "Acompañamiento durante todo el proceso",
        body: "Tienes a quién preguntarle antes, durante y después de tomar tu decisión.",
      },
      {
        title: "Atención en inglés y español",
        body: "Trabaja con nosotros en el idioma en el que te sientas más cómodo.",
      },
      {
        title: "Sin complicaciones innecesarias",
        body: "Tú compartes tus facturas. Nosotros hacemos la comparación y te traemos los resultados.",
      },
    ],
  },

  industries: {
    eyebrow: "Con quién trabajamos",
    heading: "Negocios de muchos tipos",
    intro:
      "Murillo Consulting trabaja con negocios pequeños y medianos de distintas industrias. Si tu negocio paga una factura de electricidad o gas natural, podemos revisarla.",
    items: [
      "Restaurantes y hotelería",
      "Comercios y tiendas",
      "Oficinas",
      "Almacenes y bodegas",
      "Negocios de servicios profesionales",
      "Dueños y administradores de propiedades",
      "Operaciones comerciales pequeñas y medianas",
    ],
    note: "Esta no es una lista completa. Escríbenos y te decimos cómo podemos ayudarte.",
  },

  billCta: {
    eyebrow: "Comienza",
    heading: "¿Listo para conocer las opciones disponibles para tu negocio?",
    body: "Envía tus facturas recientes de energía y Murillo Consulting comenzará la revisión. El análisis inicial generalmente se completa dentro de 3 a 4 días hábiles después de recibir toda la información necesaria.",
    primaryCta: "Envía tus facturas",
    secondaryCta: "Primero tengo una pregunta",
  },

  about: {
    eyebrow: "Tu contacto directo",
    heading: "Trabaja directamente con Larry Murillo",
    body: "Murillo Consulting ofrece una asesoría clara y personalizada para ayudar a los dueños de negocios a entender sus opciones de energía. Larry trabaja directamente con los clientes para revisar sus necesidades, explicar las oportunidades disponibles y acompañarlos durante el proceso de decisión.",
    contactName: "Larry Murillo",
    contactRole: "Murillo Consulting, LLC",
    emailLabel: "Correo electrónico",
    phoneLabel: "Teléfono",
    scheduleLabel: "Agenda una reunión",
    scheduleCta: "Reserva un horario",
    portraitAlt: "Retrato de Larry Murillo",
  },

  faq: {
    eyebrow: "Preguntas",
    heading: "Preguntas frecuentes",
    intro: "Respuestas cortas y directas a lo que más nos preguntan los dueños de negocios.",
    items: [
      {
        question: "¿Se va a interrumpir mi servicio de electricidad o gas natural?",
        answer:
          "No. Tu energía continúa llegando a través de la misma infraestructura establecida de la compañía de servicios públicos, con la misma confiabilidad esperada. Lo que revisamos es la parte de precio y suministro de tu cuenta, no la entrega física de tu servicio.",
      },
      {
        question: "¿Tengo que cambiar de compañía de servicios públicos?",
        answer:
          "No. La compañía de servicios públicos encargada de las líneas, los medidores, las interrupciones y la entrega a tu negocio sigue siendo la misma. Murillo Consulting se enfoca en ayudarte a evaluar las opciones de tarifa y suministro disponibles para tu cuenta.",
      },
      {
        question: "¿Cómo funciona el proceso?",
        answer:
          "Son tres pasos. Tú compartes tus facturas más recientes de electricidad y/o gas natural, nosotros revisamos tu información y comparamos las opciones aplicables, y después te explicamos lo que encontramos y cuáles podrían ser tus próximos pasos.",
      },
      {
        question: "¿Qué documentos necesito?",
        answer:
          "Tus facturas más recientes de electricidad y/o gas natural. Es mejor que estén completas, porque los datos de la cuenta y el historial de consumo son los que nos permiten comparar las opciones con precisión.",
      },
      {
        question: "¿Cuánto tarda el análisis?",
        answer:
          "El análisis inicial generalmente se completa dentro de 3 a 4 días hábiles después de recibir toda la información necesaria.",
      },
      {
        question: "¿Los ahorros están garantizados?",
        answer:
          "No. No garantizamos ahorros. Identificamos las opciones que podrían estar disponibles para tu negocio y te explicamos los posibles beneficios y consideraciones de cada una para que puedas tomar una decisión informada.",
      },
      {
        question: "¿Murillo Consulting puede ayudar a negocios con varias ubicaciones?",
        answer:
          "Sí. Si tienes más de una ubicación, dinos cuántas al enviar tu información e incluye las facturas de cada cuenta que quieras que revisemos.",
      },
      {
        question: "¿Hay atención en español?",
        answer:
          "Sí. Murillo Consulting trabaja con dueños de negocios en inglés y en español, y puedes usar este sitio web en cualquiera de los dos idiomas.",
      },
      {
        question: "¿Cómo se le paga a Murillo Consulting?",
        answer:
          "Comunícate directamente con Larry Murillo y él te explicará cómo funciona la compensación en tu caso.",
      },
    ],
  },

  contact: {
    eyebrow: "Contacto",
    heading: "Comienza la revisión de tu energía",
    intro:
      "Envía tu información y tus facturas recientes, o comunícate directamente si prefieres platicar primero.",
    directHeading: "¿Prefieres comunicarte directamente?",
    directBody:
      "Puedes escribir o llamar a Murillo Consulting y nosotros nos encargamos del resto.",
    responseNote:
      "Después de que envíes tu información, Murillo Consulting la revisa. El análisis inicial generalmente se completa dentro de 3 a 4 días hábiles después de recibir toda la información necesaria.",
  },

  form: {
    heading: "Envía tus facturas",
    introHeading: "¿Listo para conocer las opciones disponibles para tu negocio?",
    introBody:
      "Envía tus facturas recientes de energía y Murillo Consulting comenzará la revisión. El análisis inicial generalmente se completa dentro de 3 a 4 días hábiles después de recibir toda la información necesaria.",
    sectionContact: "Tu información de contacto",
    sectionBusiness: "Sobre tu negocio",
    sectionFiles: "Tus facturas de energía",
    sectionNotes: "Algo más",

    firstName: "Nombre",
    lastName: "Apellido",
    businessName: "Nombre del negocio",
    email: "Correo electrónico",
    phone: "Número de teléfono",
    preferredLanguage: "Idioma preferido",
    businessLocation: "Ubicación del negocio",
    businessLocationHelp: "Con la ciudad y el estado es suficiente.",
    serviceType: "¿Qué te gustaría que revisemos?",
    serviceTypeElectricity: "Electricidad",
    serviceTypeGas: "Gas natural",
    serviceTypeBoth: "Ambos",
    locationCount: "Número de ubicaciones del negocio",
    notes: "Notas adicionales",
    notesPlaceholder:
      "Lo que quieras que sepamos, por ejemplo fechas de contrato próximas o preguntas que tengas.",
    consent:
      "Acepto que Murillo Consulting me contacte sobre mis opciones de energía y revise las facturas que envío.",
    consentHelp:
      "Usamos tu información únicamente para preparar y platicar tu análisis de energía.",

    submit: "Envía tus facturas",
    submitting: "Enviando…",
    submitAnother: "Enviar otro negocio",
    privacyNotice: "Al enviar, aceptas que manejemos tu información como se describe en nuestra",
    privacyLink: "Política de privacidad",

    upload: {
      label: "Sube tus facturas",
      dropzone: "Arrastra aquí tus facturas, o",
      browse: "busca en tus archivos",
      hint: "PDF, JPG, JPEG o PNG · hasta {maxSize} por archivo · máximo {maxFiles} archivos",
      selectedFiles: "Archivos seleccionados",
      remove: "Quitar {name}",
      removed: "Archivo eliminado",
      progress: "Subiendo",
      uploadingLabel: "Progreso de la subida",
      noFiles: "Todavía no has seleccionado archivos.",
      helpText:
        "Tus facturas se usan únicamente para preparar tu análisis, se guardan de forma privada y se eliminan automáticamente después de 90 días. Si prefieres no subirlas aquí, puedes enviarlas por correo electrónico.",
    },

    errors: {
      firstNameRequired: "Escribe tu nombre.",
      lastNameRequired: "Escribe tu apellido.",
      businessNameRequired: "Escribe el nombre de tu negocio.",
      emailRequired: "Escribe tu correo electrónico.",
      emailInvalid: "Escribe un correo electrónico válido.",
      phoneRequired: "Escribe un número de teléfono.",
      phoneInvalid: "Escribe un número de teléfono válido.",
      businessLocationRequired: "Escribe la ubicación de tu negocio.",
      serviceTypeRequired: "Elige qué te gustaría que revisemos.",
      locationCountMin: "Escribe por lo menos 1 ubicación.",
      locationCountMax: "Para más de 100 ubicaciones, comunícate con nosotros directamente.",
      notesTooLong: "Escribe tus notas en menos de 2,000 caracteres.",
      consentRequired: "Confirma esto para que podamos contactarte.",
      fileTooLarge: "{name} pesa más de {maxSize}.",
      fileWrongType: "{name} no es un tipo de archivo compatible. Usa PDF, JPG, JPEG o PNG.",
      fileContentMismatch:
        "{name} no parece ser un archivo PDF o de imagen válido.",
      tooManyFiles: "Puedes adjuntar hasta {maxFiles} archivos.",
      fileEmpty: "{name} parece estar vacío.",
      summaryTitle: "Revisa lo siguiente",
      verificationPending:
        "Espera un momento a que termine la verificación de seguridad y vuelve a enviar.",
    },

    status: {
      successTitle: "Gracias",
      successBody:
        "Gracias. Recibimos tu información. Un representante de Murillo Consulting revisará tu solicitud y se comunicará contigo para explicarte los próximos pasos.",
      errorTitle: "No pudimos enviar tu información",
      errorBody:
        "Algo salió mal de nuestro lado. Inténtalo de nuevo o envíanos tus facturas directamente usando los datos de contacto que aparecen abajo.",
      unconfiguredTitle: "El envío en línea todavía no está disponible",
      unconfiguredBody:
        "Este formulario aún no está conectado a un servicio de envío. Envía tus facturas directamente a Murillo Consulting usando los datos de contacto que aparecen abajo y comenzamos de inmediato.",
      verificationTitle: "No pudimos verificar tu envío",
      verificationBody:
        "Inténtalo de nuevo. Si sigue pasando, envíanos tus facturas directamente usando los datos de contacto que aparecen abajo.",
      filesRejected:
        "Recibimos tu información, pero estos archivos no se subieron: {names}. Puedes enviárnoslos por correo electrónico.",
      retry: "Inténtalo de nuevo",
    },
  },

  footer: {
    tagline:
      "Ayudamos a los negocios a comparar opciones de electricidad y gas natural y a entender sus posibles ahorros.",
    navHeading: "Sitio",
    contactHeading: "Contacto",
    legalHeading: "Aviso",
    disclaimer:
      "Murillo Consulting, LLC ofrece servicios de asesoría en energía. Los ahorros no están garantizados. Las opciones disponibles dependen de tu compañía de servicios públicos, tu cuenta y las condiciones del mercado.",
    rights: "Todos los derechos reservados.",
    languageHeading: "Idioma",
    privacyLink: "Política de privacidad",
  },

  notFound: {
    title: "Página no encontrada",
    heading: "No encontramos esa página",
    body: "Puede que la página que buscas se haya movido o que ya no exista.",
    cta: "Ir a la página de inicio",
  },

  privacy: {
    heading: "Política de privacidad",
    updated: "Última actualización: 13 de octubre de 2026",
    intro:
      "Esta política explica qué información recopila Murillo Consulting, LLC a través de este sitio web, cómo la usamos y qué opciones tienes. Aplica a murilloconsulting.co.",
    sections: [
      {
        heading: "Información que recopilamos",
        body: [
          "Cuando envías nuestro formulario, recopilamos los datos que nos das: tu nombre, el nombre de tu negocio, tu correo electrónico, tu teléfono, la ubicación del negocio, tu idioma preferido, el número de ubicaciones y cualquier nota.",
          "Si subes facturas de energía, recibimos el contenido de esos archivos. Las facturas pueden incluir tu número de cuenta con la compañía de servicios, la dirección del servicio, tu historial de consumo y los montos facturados.",
          "Como la mayoría de los sitios web, nuestros proveedores de alojamiento y seguridad procesan automáticamente información técnica básica, como tu dirección IP y el tipo de navegador, para mostrar el sitio y protegerlo contra abusos.",
        ],
      },
      {
        heading: "Cómo usamos tu información",
        body: [
          "Usamos tu información para revisar tus costos de energía, preparar tu análisis, contactarte sobre tus opciones, responder tus preguntas y mantener seguro este sitio web.",
          "No vendemos tu información personal ni la usamos para publicidad.",
        ],
      },
      {
        heading: "Cómo la guardamos y protegemos",
        body: [
          "Tu información y tus archivos se guardan con proveedores de servicios en la nube en Estados Unidos. Están cifrados, se mantienen privados y solo los miembros autorizados de nuestro equipo pueden acceder a ellos.",
          "Ningún método de almacenamiento o transmisión es completamente seguro, pero tomamos medidas razonables para proteger tu información.",
        ],
      },
      {
        heading: "Cuánto tiempo la conservamos",
        body: [
          "Los formularios y las facturas enviados por este sitio web se eliminan automáticamente unos 90 días después de que los envías. Si te conviertes en cliente, podemos conservar la información que necesitamos para darte nuestros servicios, o por más tiempo si la ley lo exige.",
        ],
      },
      {
        heading: "Con quién la compartimos",
        body: [
          "Compartimos tu información solo con proveedores que nos ayudan a operar este sitio web y nuestro negocio, como el alojamiento del sitio (Vercel), el almacenamiento seguro y el envío de correos (Amazon Web Services), la protección contra spam (Cloudflare) y el correo de la empresa (Microsoft). Solo pueden usarla para darnos sus servicios.",
          "También podemos compartir información cuando tú nos lo pides, por ejemplo para solicitar precios a un proveedor de energía en tu nombre, o cuando la ley lo exige.",
        ],
      },
      {
        heading: "Cookies y la verificación de seguridad",
        body: [
          "Este sitio web no usa cookies de publicidad. Nuestro formulario usa Cloudflare Turnstile para distinguir a los visitantes reales del spam automatizado. Para eso puede recopilar información sobre tu dispositivo y tu navegador, como se describe en la política de privacidad de Cloudflare.",
        ],
      },
      {
        heading: "Tus opciones",
        body: [
          "Puedes pedirnos en cualquier momento que te digamos qué información tenemos sobre ti, que la corrijamos o que la eliminemos. Escríbenos y te responderemos en un tiempo razonable.",
        ],
      },
      {
        heading: "Menores de edad",
        body: [
          "Este sitio web está pensado para negocios y no está dirigido a menores de 13 años. No recopilamos a sabiendas información de menores.",
        ],
      },
      {
        heading: "Cambios a esta política",
        body: [
          "Podemos actualizar esta política de vez en cuando. La fecha de arriba indica cuándo cambió por última vez.",
        ],
      },
      {
        heading: "Contáctanos",
        body: ["¿Tienes preguntas sobre esta política o tu información? Escríbenos a:"],
      },
    ],
  },

  seo: {
    homeTitle:
      "Murillo Consulting, LLC | Mejores tarifas de energía para tu negocio",
    homeDescription:
      "Murillo Consulting ayuda a negocios pequeños y medianos a comparar opciones de electricidad y gas natural, identificar posibles ahorros y tomar decisiones informadas con asesoría personalizada en inglés y español.",
    notFoundTitle: "Página no encontrada | Murillo Consulting, LLC",
    notFoundDescription:
      "No pudimos encontrar la página que buscas. Vuelve a la página de inicio de Murillo Consulting.",
    privacyTitle: "Política de privacidad | Murillo Consulting, LLC",
    privacyDescription:
      "Cómo Murillo Consulting recopila, usa, guarda y elimina la información y las facturas de energía que compartes en este sitio web.",
  },
};

export default es;
