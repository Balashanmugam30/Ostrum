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
      highlight?: string;
      highlight2?: string;
      supporting?: string;
    }>;
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
          id: "tools",
          number: "01",
          primary: "Your tools don't work together.",
          supporting: "Your team wastes time switching between systems and repeating work.",
        },
        {
          id: "hard",
          number: "02",
          primary: "It shouldn't be this hard.",
          supporting: "",
        },
        {
          id: "better",
          number: "03",
          primary: "We make your business work better.",
          supporting: "We build websites, software and automation that connect your tools, simplify daily work and help your team move faster.",
        },
        {
          id: "solve",
          number: "04",
          primary: "Got a problem no product solves?",
          supporting: "We turn real problems into useful software and original products.",
        },
        {
          id: "next",
          number: "05",
          primary: "Ready to build what comes next?",
          supporting: "From better business systems to original products, we build technology that makes work simpler and new ideas possible.",
          highlight: "makes work simpler",
          highlight2: "new ideas possible",
        },
      ],
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
          id: "tools",
          number: "01",
          primary: "Vos outils ne fonctionnent pas ensemble.",
          supporting: "Votre équipe perd du temps à basculer entre les systèmes et à répéter les tâches.",
        },
        {
          id: "hard",
          number: "02",
          primary: "Ça ne devrait pas être si difficile.",
          supporting: "",
        },
        {
          id: "better",
          number: "03",
          primary: "Nous faisons mieux fonctionner votre entreprise.",
          supporting: "Nous concevons des sites, des logiciels et de l'automatisation qui connectent vos outils, simplifient le travail quotidien et aident votre équipe à avancer plus vite.",
        },
        {
          id: "solve",
          number: "04",
          primary: "Un problème qu'aucun produit ne résout ?",
          supporting: "Nous transformons des problèmes réels en logiciels utiles et en produits originaux.",
        },
        {
          id: "next",
          number: "05",
          primary: "Prêt à bâtir ce qui vient ensuite ?",
          supporting: "Des meilleurs systèmes d'entreprise aux produits originaux, nous créons la technologie qui simplifie le travail et rend les nouvelles idées possibles.",
          highlight: "simplifie le travail",
          highlight2: "rend les nouvelles idées possibles",
        },
      ],
    },
  },
};
