export type Locale = 'en' | 'fr';

export interface ContentMessages {
  hero: {
    descLine1: string;
    descLine2: string;
    cta: string;
    sublabel: string;
  };
  bookInfos: {
    titleLine1: string;
    titleLine2: string;
    desc: string[];
    cta: string;
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
      descLine1: "A year ago, I was told I had a rare chronic blood cancer.",
      descLine2: "Since then, I've been trying to see things more clearly.",
      cta: "Get the book",
      sublabel: "Also available as a digital edition",
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
      descLine1: "Il y a un an, on m'annonce",
      descLine2: "un cancer du sang chronique rare. Depuis, j'essaie d'y voir plus clair.",
      cta: "Obtenir le livre",
      sublabel: "Existe aussi en version numérique",
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
