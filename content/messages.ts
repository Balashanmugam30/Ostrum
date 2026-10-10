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
    badge: string;
    beats: Array<{
      id: string;
      number: string;
      tag: string;
      primary: string;
      supporting: string;
    }>;
  };
  footerCta: {
    line1: string;
    line1Highlight: string;
    line2: string;
    line2Highlight: string;
    line3: string;
    line3Highlight: string;
    line3Suffix: string;
    cta: string;
    sublabel: string;
  };
  footer: {
    instagram: string;
    contact: string;
    copyright: string;
    cta: string;
  };
  modal: {
    closeLabel: string;
    physicalTab: string;
    digitalTab: string;
    physicalPrice: string;
    physicalShipping: string;
    physicalDetails: string[];
    physicalBuyCta: string;
    digitalPrice: string;
    digitalDetails: string[];
    digitalBuyCta: string;
  };
}

export const messages: Record<Locale, ContentMessages> = {
  en: {
    hero: {
      headline: "We build the technology that helps businesses **grow**\nAnd create original products for problems worth solving",
      philosophyLine1: "High-leverage digital systems for ambitious companies.",
      philosophyLine2: "Independent software and ventures for what the world still needs.",
      cta: "",
      sublabel: "",
    },
    engine: {
      index: "02 / THE OSTRUM CORE",
      badge: "ENGINE · VENTURE · FOUNDRY",
      headlineLine1: "We build for today.",
      headlineLine2: "We build what's next.",
      description: "Ostrum works in two directions: we solve critical engineering and operational problems for ambitious businesses, and we create original products when the right answer doesn't exist yet.",
      forBusiness: {
        number: "01",
        tag: "FOR BUSINESS",
        statement: "Systems that make ambitious companies move better.",
        detail: "Flagship web architecture, custom software, and automated infrastructure engineered for compound advantage.",
      },
      forNext: {
        number: "02",
        tag: "FOR WHAT'S NEXT",
        statement: "Products and ventures built around problems worth solving.",
        detail: "Identifying acute friction, validating solutions from first principles, and engineering original software and ventures.",
      },
      backing: {
        statement: "Some ideas become products. Some products become ventures.",
        subtext: "Selected high-conviction initiatives may receive dedicated Ostrum product, engineering, and venture backing.",
        triad: "BUILD · DISCOVER · BACK",
      },
    },
    energyNarrative: {
      badge: "03 / THE CONTINUUM",
      beats: [
        {
          id: "systems",
          number: "01",
          tag: "SYSTEMS ARCHITECTURE",
          primary: "Complexity, made coherent.",
          supporting: "We connect technology, people and operations into systems that work together.",
        },
        {
          id: "intelligence",
          number: "02",
          tag: "APPLIED INTELLIGENCE",
          primary: "Intelligence, put to work.",
          supporting: "We turn ambitious ideas into useful software, automation and intelligent tools.",
        },
        {
          id: "future",
          number: "03",
          tag: "WHAT COMES NEXT",
          primary: "We build what doesn't exist yet.",
          supporting: "We discover unmet needs and create original products around real problems.",
        },
      ],
    },
    footerCta: {
      line1: "A year ago, on the other side of the ",
      line1Highlight: "ocean",
      line2: "everything shifted into a ",
      line2Highlight: "new perspective",
      line3: "This book ",
      line3Highlight: "was born",
      line3Suffix: " from that.",
      cta: "Get the book",
      sublabel: "Also available as a digital edition",
    },
    footer: {
      instagram: "Instagram",
      contact: "Contact",
      copyright: "© 2026",
      cta: "Get the book",
    },
    modal: {
      closeLabel: "Close",
      physicalTab: "Physical book",
      digitalTab: "Digital edition",
      physicalPrice: "22€",
      physicalShipping: "+ €4 worldwide shipping",
      physicalDetails: [
        "Hardcover with matte finish",
        "High-quality colour print on coated paper",
        "A beautiful object to keep or give as a gift",
        "Access to all 6 generative digital experiences",
        "Worldwide shipping",
      ],
      physicalBuyCta: "Buy the book",
      digitalPrice: "8€",
      digitalDetails: [
        "High-quality PDF",
        "Access to all 6 generative digital experiences",
        "Instant download after purchase",
      ],
      digitalBuyCta: "Buy the ebook",
    },
  },
  fr: {
    hero: {
      headline: "Nous créons la technologie qui fait **grandir** les entreprises\nEt les produits originaux dont le monde a besoin",
      philosophyLine1: "Des systèmes digitaux à fort levier pour les entreprises ambitieuses.",
      philosophyLine2: "Des logiciels et initiatives pour les défis qui comptent.",
      cta: "",
      sublabel: "",
    },
    engine: {
      index: "02 / LE CŒUR OSTRUM",
      badge: "MOTEUR · VENTURE · FOUNDRY",
      headlineLine1: "Nous construisons pour aujourd'hui.",
      headlineLine2: "Nous créons ce qui vient ensuite.",
      description: "Ostrum opère dans deux directions : nous résolvons les défis technologiques et opérationnels des entreprises ambitieuses, et nous concevons des produits originaux quand la solution n'existe pas encore.",
      forBusiness: {
        number: "01",
        tag: "POUR LES ENTREPRISES",
        statement: "Des systèmes qui font avancer les entreprises ambitieuses.",
        detail: "Architectures web d'exception, logiciels sur-mesure et infrastructures automatisées conçues pour l'échelle.",
      },
      forNext: {
        number: "02",
        tag: "POUR L'AVENIR",
        statement: "Des produits et projets bâtis autour de vrais problèmes.",
        detail: "Détecter les frictions réelles, valider sur le terrain et concevoir des logiciels et ventures indépendants.",
      },
      backing: {
        statement: "Certaines idées deviennent des produits. Certains produits deviennent des ventures.",
        subtext: "Les initiatives à forte conviction sélectionnées peuvent recevoir un soutien technique, produit et opérationnel d'Ostrum.",
        triad: "CONSTRUIRE · DÉCOUVRIR · SOUTENIR",
      },
    },
    energyNarrative: {
      badge: "03 / LE CONTINUUM",
      beats: [
        {
          id: "systems",
          number: "01",
          tag: "ARCHITECTURE DES SYSTÈMES",
          primary: "La complexité, rendue cohérente.",
          supporting: "Nous unissons technologie, équipes et opérations au sein de systèmes synchronisés.",
        },
        {
          id: "intelligence",
          number: "02",
          tag: "INTELLIGENCE APPLIQUÉE",
          primary: "L'intelligence, mise à l'œuvre.",
          supporting: "Nous transformons les idées ambitieuses en logiciels utiles, automatisations et outils intelligents.",
        },
        {
          id: "future",
          number: "03",
          tag: "PERSPECTIVES & PRODUITS",
          primary: "Nous construisons ce qui n'existe pas encore.",
          supporting: "Nous identifions les frictions réelles et concevons des produits originaux pour des besoins cruciaux.",
        },
      ],
    },
    footerCta: {
      line1: "Il y a un an, à l'autre bout de l'",
      line1Highlight: "océan",
      line2: "tout a pris une ",
      line2Highlight: "autre perspective",
      line3: "Ce livre ",
      line3Highlight: "est né",
      line3Suffix: " de là.",
      cta: "Obtenir le livre",
      sublabel: "Existe aussi en version numérique",
    },
    footer: {
      instagram: "Instagram",
      contact: "Contact",
      copyright: "© 2026",
      cta: "Obtenir le livre",
    },
    modal: {
      closeLabel: "Fermer",
      physicalTab: "Livre physique",
      digitalTab: "Version numérique",
      physicalPrice: "22€",
      physicalShipping: "+ 4€ de livraison",
      physicalDetails: [
        "Couverture rigide, finition mat",
        "Impression couleur haute qualité sur papier couché",
        "Un bel objet à garder ou à offrir",
        "Accès aux 6 expériences numériques génératives",
        "Livraison mondiale",
      ],
      physicalBuyCta: "Acheter le livre",
      digitalPrice: "8€",
      digitalDetails: [
        "PDF haute qualité",
        "Accès aux 6 expériences numériques génératives",
        "Téléchargement immédiat après achat",
      ],
      digitalBuyCta: "Acheter le ebook",
    },
  },
};
