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
    headlinePart1: string;
    headlineHighlight1: string;
    headlinePart2: string;
    headlineHighlight2: string;
    description: string;
    coreBadge: string;
    coreLabel: string;
    coreSub: string;
    studio: {
      number: string;
      title: string;
      tagline: string;
      description: string;
      capabilities: Array<{ label: string; detail: string }>;
      cta: string;
      footnote: string;
    };
    foundry: {
      number: string;
      title: string;
      tagline: string;
      description: string;
      capabilities: Array<{ label: string; detail: string }>;
      cta: string;
      footnote: string;
    };
    sharedSynergy: {
      label: string;
      statement: string;
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
      index: "02 / THE OSTRUM ENGINE",
      badge: "ONE COMPANY · TWO ENGINES",
      headlinePart1: "We build for businesses.",
      headlineHighlight1: "We build",
      headlinePart2: "We build what doesn't exist yet.",
      headlineHighlight2: "what doesn't exist yet",
      description: "Ostrum operates as two synchronized engines powered by a single core of engineering, design, and product discipline. We partner with established companies to build high-leverage systems, while independently creating original software and ventures for problems we observe in the world.",
      coreBadge: "THE OSTRUM CORE",
      coreLabel: "OSTRUM",
      coreSub: "ONE CORE · TWO OUTCOMES",
      studio: {
        number: "01",
        title: "STUDIO",
        tagline: "Client Systems & Digital Modernization",
        description: "We partner with ambitious companies to build flagship web experiences, custom software, and automated operational architecture that compound leverage.",
        capabilities: [
          { label: "Brand & Experience", detail: "Signature digital identity and immersive web" },
          { label: "Custom Software", detail: "Resilient applications engineered for scale" },
          { label: "AI & Automation", detail: "Intelligent workflows eliminating operational drag" },
          { label: "Technical Infrastructure", detail: "Modern, maintainable software foundations" },
        ],
        cta: "Partner with Studio",
        footnote: "SYSTEMS FOR AMBITIOUS COMPANIES",
      },
      foundry: {
        number: "02",
        title: "FOUNDRY",
        tagline: "Original Products & Venture Incubation",
        description: "We identify acute friction, validate solutions directly with users, and engineer independent products from scratch — backing high-conviction ideas with dedicated execution and operating depth.",
        capabilities: [
          { label: "Problem Discovery", detail: "Identifying market gaps and friction worth solving" },
          { label: "Rapid Validation", detail: "User testing and concept stress-testing before code" },
          { label: "Product Engineering", detail: "Crafting end-to-end proprietary software" },
          { label: "Venture Incubation", detail: "Operational, technical, and strategic co-building" },
        ],
        cta: "Explore Active Products",
        footnote: "ORIGINAL PRODUCTS & VENTURES",
      },
      sharedSynergy: {
        label: "THE ENGINE DYNAMICS",
        statement: "Every insight gained from building enterprise software sharpens our proprietary products. Every breakthrough discovered in our ventures elevates our client architecture.",
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
      index: "02 / LE MOTEUR OSTRUM",
      badge: "UNE ENTREPRISE · DEUX MOTEURS",
      headlinePart1: "Nous construisons pour les entreprises.",
      headlineHighlight1: "Nous construisons",
      headlinePart2: "Nous concevons ce qui n'existe pas encore.",
      headlineHighlight2: "ce qui n'existe pas encore",
      description: "Ostrum déploie deux moteurs synchronisés animés par un même noyau d'ingénierie, de design et de rigueur produit. Nous accompagnons les entreprises pour bâtir des systèmes à fort levier, tout en créant de façon autonome des logiciels et initiatives pour les défis du monde réel.",
      coreBadge: "LE CŒUR OSTRUM",
      coreLabel: "OSTRUM",
      coreSub: "UN CŒUR · DEUX DYNAMISQUES",
      studio: {
        number: "01",
        title: "STUDIO",
        tagline: "Systèmes Clients & Modernisation Numérique",
        description: "Nous concevons pour des entreprises ambitieuses des expériences web d'exception, des logiciels sur-mesure et des architectures d'automatisation à fort impact.",
        capabilities: [
          { label: "Marque & Expérience", detail: "Identités digitales et interfaces immersives" },
          { label: "Logiciels Sur-Mesure", detail: "Applications robustes pensées pour l'échelle" },
          { label: "IA & Automatisation", detail: "Flux intelligents réduisant la friction opérationnelle" },
          { label: "Infrastructure Technique", detail: "Socles logiciels modernes et durables" },
        ],
        cta: "Collaborer avec le Studio",
        footnote: "SYSTÈMES POUR ENTREPRISES AMBITIEUSES",
      },
      foundry: {
        number: "02",
        title: "FOUNDRY",
        tagline: "Produits Originaux & Création de Projets",
        description: "Nous identifions les frictions réelles, validons les solutions directement avec les utilisateurs et concevons des produits indépendants — avec une exécution rigoureuse et une profondeur opérationnelle.",
        capabilities: [
          { label: "Détection de Problèmes", detail: "Identifier les besoins et inefficacités critiques" },
          { label: "Validation Rapide", detail: "Tests d'usage et confrontation terrain avant le code" },
          { label: "Ingénierie Produit", detail: "Développement de logiciels propriétaires complets" },
          { label: "Incubation de Projets", detail: "Co-construction technique, produit et stratégique" },
        ],
        cta: "Découvrir nos Produits",
        footnote: "PRODUITS ORIGINAUX & VENTURES",
      },
      sharedSynergy: {
        label: "DYNAMIQUE DU MOTEUR",
        statement: "Chaque défi résolu en entreprise enrichit nos produits originaux. Chaque percée réalisée dans nos ventures élève l'architecture de nos systèmes clients.",
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
