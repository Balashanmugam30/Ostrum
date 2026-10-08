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
  gallery: {
    title: string;
    subtitleLine1: string;
    subtitleLine2: string;
    hintDesktop: string;
    hintMobile: string;
    chapters: Array<{
      id: string;
      number: string;
      title: string;
      image: string;
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
    gallery: {
      title: "The Experiences",
      subtitleLine1: "Each chapter opens a digital space.",
      subtitleLine2: "To explore, feel, generate.",
      hintDesktop: "Move your mouse to navigate the spaces",
      hintMobile: "Touch and drag to explore",
      chapters: [
        { id: "xp-1", number: "01", title: "First Signs", image: "/images/teaser/xp-1.webp" },
        { id: "xp-2", number: "02", title: "The Wait", image: "/images/teaser/xp-2.webp" },
        { id: "xp-3", number: "03", title: "The Verdict", image: "/images/teaser/xp-3.webp" },
        { id: "xp-4", number: "04", title: "The Body", image: "/images/teaser/xp-4.webp" },
        { id: "xp-5", number: "05", title: "The Return", image: "/images/teaser/xp-5.webp" },
        { id: "xp-6", number: "06", title: "Clarity", image: "/images/teaser/xp-6.webp" },
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
    gallery: {
      title: "Les expériences",
      subtitleLine1: "Chaque chapitre ouvre un espace numérique.",
      subtitleLine2: "À explorer, ressentir, générer.",
      hintDesktop: "Déplacez votre curseur pour naviguer les espaces",
      hintMobile: "Touchez et glissez pour explorer",
      chapters: [
        { id: "xp-1", number: "01", title: "Premiers signes", image: "/images/teaser/xp-1.webp" },
        { id: "xp-2", number: "02", title: "L'attente", image: "/images/teaser/xp-2.webp" },
        { id: "xp-3", number: "03", title: "Le verdict", image: "/images/teaser/xp-3.webp" },
        { id: "xp-4", number: "04", title: "Le corps", image: "/images/teaser/xp-4.webp" },
        { id: "xp-5", number: "05", title: "Le retour", image: "/images/teaser/xp-5.webp" },
        { id: "xp-6", number: "06", title: "Clarté", image: "/images/teaser/xp-6.webp" },
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
