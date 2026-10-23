export type Locale = 'en' | 'fr';

export interface ContentMessages {
  hero: {
    headline: string;
    philosophyLine1: string;
    philosophyLine2: string;
    cta: string;
    sublabel: string;
  };
  engine: {
    index: string;
    badge: string;
    headlineLine1: string;
    headlineLine2: string;
    description: string;
    forBusiness: {
      number: string;
      tag: string;
      statement: string;
      detail: string;
    };
    forNext: {
      number: string;
      tag: string;
      statement: string;
      detail: string;
    };
    backing: {
      statement: string;
      subtext: string;
      triad: string;
    };
  };
  energyNarrative: {
    badge?: string;
    beats: Array<{
      id: string;
      number: string;
      primary: string;
      brandSignoff?: string;
      highlight?: string;
      highlight2?: string;
      supporting?: string;
    }>;
  };
}

export const messages: Record<Locale, ContentMessages> = {
  en: {
    hero: {
      headline: "We engineer custom software that helps businesses **scale**\nAnd build original products for problems worth solving",
      philosophyLine1: "Custom digital systems, intelligent AI workflows, and modern web platforms.",
      philosophyLine2: "Direct access to engineering principals, with an additional venture studio path.",
      cta: "",
      sublabel: "",
    },
    engine: {
      index: "02 / THE OSTRUM CORE",
      badge: "STUDIO · SYSTEMS · VENTURES",
      headlineLine1: "We build for today.",
      headlineLine2: "We build what's next.",
      description: "Ostrum operates across two disciplined paths: we scope and engineer custom digital systems for ambitious businesses, and we build focused original products when the right solution does not exist yet.",
      forBusiness: {
        number: "01",
        tag: "FOR BUSINESS",
        statement: "Custom systems engineered around how your business works.",
        detail: "Tailored business software, modern web platforms, and automated AI workflows built for operational clarity and long-term maintainability.",
      },
      forNext: {
        number: "02",
        tag: "FOR WHAT'S NEXT",
        statement: "Original products engineered around real problems.",
        detail: "Identifying workflow friction, proving solutions from first principles, and engineering focused software ventures such as the MNESA platform.",
      },
      backing: {
        statement: "Some ideas become products. Some products become ventures.",
        subtext: "Selected high-conviction initiatives may receive dedicated Ostrum product, engineering, and collaborative venture backing.",
        triad: "ENGINEER · INTEGRATE · LAUNCH",
      },
    },
    energyNarrative: {
      badge: "03 / THE CONTINUUM",
      beats: [
        {
          id: "business-as-one",
          number: "01",
          primary: "Make your business work as one coherent system.",
        },
        {
          id: "less-busywork",
          number: "02",
          primary: "Automate manual bottlenecks. Create room to build.",
        },
        {
          id: "everything-connects",
          number: "03",
          primary: "Software works best when every workflow connects.",
        },
        {
          id: "ideas-to-products",
          number: "04",
          primary: "Turn sharp ideas into resilient digital products.",
        },
        {
          id: "ready-next",
          number: "05",
          primary: "Ready to engineer what is next?",
          brandSignoff: "OSTRUM",
        },
      ],
    },
  },
  fr: {
    hero: {
      headline: "Nous concevons des logiciels sur-mesure pour faire **grandir** les entreprises\nEt développons des produits originaux pour les défis essentiels",
      philosophyLine1: "Systèmes digitaux sur-mesure, flux d'IA intelligents et plateformes web modernes.",
      philosophyLine2: "Accès direct aux ingénieurs concepteurs, complété par un pôle venture dédié.",
      cta: "",
      sublabel: "",
    },
    engine: {
      index: "02 / LE CŒUR OSTRUM",
      badge: "STUDIO · SYSTÈMES · VENTURES",
      headlineLine1: "Nous construisons pour aujourd'hui.",
      headlineLine2: "Nous concevons ce qui vient ensuite.",
      description: "Ostrum opère selon deux axes précis : nous concevons des systèmes sur-mesure pour les entreprises en croissance, et nous développons des produits originaux lorsque la solution n'existe pas encore.",
      forBusiness: {
        number: "01",
        tag: "POUR LES ENTREPRISES",
        statement: "Des systèmes sur-mesure adaptés au fonctionnement réel de votre entreprise.",
        detail: "Logiciels métier dédiés, plateformes web avancées et automatisations par IA conçues pour la pérennité technique.",
      },
      forNext: {
        number: "02",
        tag: "POUR L'AVENIR",
        statement: "Des produits originaux construits autour de vrais besoins.",
        detail: "Identifier les frictions concrètes, valider les principes fondamentaux et développer des ventures logicielles ciblées comme MNESA.",
      },
      backing: {
        statement: "Certaines idées deviennent des produits. Certains produits deviennent des ventures.",
        subtext: "Les initiatives sélectionnées à forte conviction peuvent bénéficier d'un accompagnement technique, produit et venture par Ostrum.",
        triad: "CONCEVOIR · INTÉGRER · DÉPLOYER",
      },
    },
    energyNarrative: {
      badge: "03 / LE CONTINUUM",
      beats: [
        {
          id: "business-as-one",
          number: "01",
          primary: "Faites fonctionner votre entreprise comme un système uni.",
        },
        {
          id: "less-busywork",
          number: "02",
          primary: "Automatisez les tâches manuelles. Libérez du temps pour créer.",
        },
        {
          id: "everything-connects",
          number: "03",
          primary: "Vos logiciels gagnent en efficacité lorsque tout est connecté.",
        },
        {
          id: "ideas-to-products",
          number: "04",
          primary: "Transformez les idées prometteuses en produits digitaux solides.",
        },
        {
          id: "ready-next",
          number: "05",
          primary: "Prêt à concevoir ce qui vient ensuite ?",
          brandSignoff: "OSTRUM",
        },
      ],
    },
  },
};
