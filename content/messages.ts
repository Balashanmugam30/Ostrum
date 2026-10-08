export type Locale = 'en' | 'fr';

export interface ContentMessages {
  hero: {
    headline: string;
    philosophyLine1: string;
    philosophyLine2: string;
    cta: string;
    sublabel: string;
  };
  bookInfos: {
    titleLine1: string;
    titleLine2: string;
    desc: string[];
    cta: string;
  };
  foundry: {
    index: string;
    badge: string;
    headlineLine1: string;
    headlineLine2: string;
    description: string;
    steps: Array<{
      num: string;
      title: string;
      detail: string;
    }>;
    cta: string;
    sublabel: string;
    flipHint: string;
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
    bookInfos: {
      titleLine1: "An experiential",
      titleLine2: "book",
      desc: [
        "This project takes the form of a book.",
        "A book to read, but also to experience.",
        "Each chapter extends into a",
        "digital experience.",
      ],
      cta: "Order the book",
    },
    foundry: {
      index: "02 / OSTRUM FOUNDRY",
      badge: "TECHNOLOGY · DESIGN · VENTURES",
      headlineLine1: "We don't only build for businesses.",
      headlineLine2: "We build what **doesn't exist yet**.",
      description: "We partner with ambitious companies to solve complex operational challenges. And when a critical solution doesn't yet exist in the market, we build it ourselves — taking original ideas from first observation to production software and independent ventures.",
      steps: [
        { num: "01", title: "FIND", detail: "Real problems worth solving." },
        { num: "02", title: "VALIDATE", detail: "Talk to people. Test the need before building." },
        { num: "03", title: "BUILD", detail: "Design the product. Engineer the technology." },
        { num: "04", title: "LAUNCH", detail: "Put it in the real world with immediate feedback loops." },
        { num: "05", title: "BACK", detail: "Support promising ideas with product, people, and operating depth. Selected initiatives may receive dedicated studio backing." },
      ],
      cta: "Explore the studio",
      sublabel: "ORIGINAL VENTURES & COLLABORATIVE LABS",
      flipHint: "Inspect dossier back",
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
    bookInfos: {
      titleLine1: "Un livre",
      titleLine2: "expérientiel",
      desc: [
        "Ce projet prend la forme d'un livre.",
        "Un livre à lire, mais aussi à traverser.",
        "Chaque chapitre se prolonge par une",
        "expérience numérique.",
      ],
      cta: "Commander le livre",
    },
    foundry: {
      index: "02 / OSTRUM FOUNDRY",
      badge: "TECHNOLOGIE · DESIGN · VENTURES",
      headlineLine1: "Nous ne construisons pas seulement pour les entreprises.",
      headlineLine2: "Nous concevons ce qui **n'existe pas encore**.",
      description: "Nous accompagnons les entreprises ambitieuses dans leurs défis technologiques. Et lorsqu'une solution essentielle n'existe pas sur le marché, nous la construisons nous-mêmes — de l'idée originelle jusqu'au produit déployé et aux ventures indépendantes.",
      steps: [
        { num: "01", title: "TROUVER", detail: "Des problèmes réels qui méritent d'être résolus." },
        { num: "02", title: "VALIDER", detail: "Échanger avec les usagers. Valider le besoin avant de construire." },
        { num: "03", title: "CONSTRUIRE", detail: "Concevoir le produit. Développer une technologie robuste." },
        { num: "04", title: "LANCER", detail: "Mettre le produit dans le monde réel avec des boucles de retour." },
        { num: "05", title: "SOUTENIR", detail: "Apporter compétences produit, équipe et exécution. Les initiatives sélectionnées peuvent recevoir un soutien direct d'Ostrum." },
      ],
      cta: "Découvrir le studio",
      sublabel: "VENTURES ORIGINALES & LABS COLLABORATIFS",
      flipHint: "Cliquer pour voir le verso",
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
