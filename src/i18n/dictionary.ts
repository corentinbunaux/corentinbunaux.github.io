import { useLanguage } from "./LanguageContext";

/**
 * The UI dictionary, nested by the component that consumes each group of
 * keys. Every leaf is a plain, already-resolved string — unlike
 * `src/data/projects.ts`'s bilingual fields, which store `{ fr, en }` pairs
 * because that data crosses the app/route boundary before a language is
 * known. Here the `Dictionary` interface is shared by both `fr` and `en`
 * objects below, so a missing translation is a compile error, not a runtime
 * fallback.
 */
export interface Dictionary {
  common: {
    profile: string;
    projects: string;
    about: string;
    /** January..December, in order — shared by the journey timeline and the
     * project page's duration formatting. */
    months: readonly string[];
  };
  navbar: {
    experiences: string;
    languageGroupLabel: string;
  };
  hero: {
    greeting: string;
    namePrefix: string;
    cta: string;
    avatarAlt: string;
  };
  profile: {
    title: string;
    skillsTitle: string;
    roleIntro: string;
    roleClient: string;
    roleLocation: string;
    educationIntro: string;
    cpgeTerm: string;
    educationMid1: string;
    educationMid2: string;
    educationOutro: string;
    experienceSummary: string;
    personality: string;
    seeProjects: string;
    languagesIntro: string;
    englishName: string;
    englishLevel: string;
    languagesMid: string;
    spanishName: string;
    spanishLevel: string;
    frenchName: string;
    toolsIntro: string;
  };
  journey: {
    title: string;
    currentBadge: string;
    ongoingLabel: string;
  };
  projects: {
    filterGroupLabel: string;
    filters: {
      all: string;
      pro: string;
      recherche: string;
      ecole: string;
      perso: string;
    };
    previewComing: string;
  };
  projectPage: {
    breadcrumbLabel: string;
    home: string;
    context: string;
    gallery: string;
    visualAltPrefix: string;
    photoLabel: string;
    logoLabel: string;
    enBref: string;
    role: string;
    duration: string;
    team: string;
    stack: string;
    result: string;
    viewRepo: string;
    navBetweenProjects: string;
    prevProject: string;
    nextProject: string;
    since: string;
    monthSingular: string;
    monthPlural: string;
  };
  about: {
    title: string;
    tennisWord: string;
    tennisIntro: string;
    tennisOutro: string;
    tournaments: string;
    otherSports: string;
    interestsLabel: string;
    pushButton: string;
    interests: {
      tennis: string;
      climbing: string;
      swimming: string;
      running: string;
      chess: string;
      videoGames: string;
      sudoku: string;
      code: string;
    };
  };
  footer: {
    workTogether: string;
    availability: string;
    contactCta: string;
    navHeading: string;
    contactHeading: string;
    emailLabel: string;
  };
}

const fr: Dictionary = {
  common: {
    profile: "Profil",
    projects: "Projets",
    about: "À propos",
    months: [
      "janvier",
      "février",
      "mars",
      "avril",
      "mai",
      "juin",
      "juillet",
      "août",
      "septembre",
      "octobre",
      "novembre",
      "décembre",
    ],
  },
  navbar: {
    experiences: "Expériences",
    languageGroupLabel: "Choisir la langue",
  },
  hero: {
    greeting: "Hey !",
    namePrefix: "Je m'appelle",
    cta: "Voir mes projets",
    avatarAlt: "Photo de Corentin Bunaux",
  },
  profile: {
    title: "Profil",
    skillsTitle: "Compétences",
    roleIntro: "Ingénieur logiciel fullstack chez ",
    roleClient: ", en prestation pour ",
    roleLocation: " depuis ",
    educationIntro: "À l'issue des ",
    cpgeTerm: "classes préparatoires (CPGE)",
    educationMid1: ", j'ai intégré l'École des ",
    educationMid2: ", à travers le cursus ",
    educationOutro: ", dont je suis diplômé.",
    experienceSummary:
      "Mes précédentes expériences en entreprise m'ont permis d'appliquer mes acquis académiques, tout en développant de nouvelles compétences.",
    personality:
      "Je suis quelqu'un de naturellement curieux, avec le sens du détail, et qui porte un certain intérêt envers les nouvelles technologies.",
    seeProjects: "Voir les projets",
    languagesIntro: "Je parle ",
    englishName: "anglais",
    englishLevel: " à niveau professionnel (C1, score TOIEC : ",
    languagesMid: "), et ",
    spanishName: "espagnol",
    spanishLevel:
      " à niveau intermédiaire (B1), en plus de ma langue maternelle qui est le ",
    frenchName: "français",
    toolsIntro:
      "Une pluralité de projets scolaires, personnels, et en entreprise m'ont permis de développer une aisance avec les logiciels et langages de programmations qui suivent.",
  },
  journey: {
    title: "Parcours",
    currentBadge: "Poste actuel",
    ongoingLabel: "aujourd'hui",
  },
  projects: {
    filterGroupLabel: "Filtrer les projets par nature",
    filters: {
      all: "Tous",
      pro: "Pro",
      recherche: "Recherche",
      ecole: "École",
      perso: "Perso",
    },
    previewComing: "Aperçu à venir",
  },
  projectPage: {
    breadcrumbLabel: "Fil d'Ariane",
    home: "Accueil",
    context: "Contexte",
    gallery: "Galerie",
    visualAltPrefix: "Visuel du projet ",
    photoLabel: "photo",
    logoLabel: "Logo",
    enBref: "En bref",
    role: "Rôle",
    duration: "Durée",
    team: "Équipe",
    stack: "Stack",
    result: "Résultat",
    viewRepo: "Voir le dépôt GitHub",
    navBetweenProjects: "Navigation entre projets",
    prevProject: "Projet précédent",
    nextProject: "Projet suivant",
    since: "Depuis",
    monthSingular: "mois",
    monthPlural: "mois",
  },
  about: {
    title: "À propos",
    tennisWord: "TENNIS",
    tennisIntro: "J'ai pratiqué le ",
    tennisOutro:
      " depuis que je suis enfant. J'ai eu l'opportunité d'entraîner des groupes d'élèves lors d'évènements compétitifs.",
    tournaments:
      "Pendant dix ans, ma constante participation à des tournois a renforcé ma persévérance et mon esprit de compétition de manière significative.",
    otherSports:
      "Depuis peu, je pratique d'autres sports tels que l'escalade, la natation ou la course à pieds.",
    interestsLabel: "Centres d'intérêt",
    pushButton: "PUSH !",
    interests: {
      tennis: "Tennis",
      climbing: "Escalade",
      swimming: "Natation",
      running: "Course",
      chess: "Échecs",
      videoGames: "Jeu vidéo",
      sudoku: "Sudoku",
      code: "Code",
    },
  },
  footer: {
    workTogether: "Travaillons ensemble",
    availability:
      "Ouvert aux missions en prestation depuis Le Havre, sur site à La Défense ou à distance.",
    contactCta: "Me contacter",
    navHeading: "Navigation",
    contactHeading: "Contact",
    emailLabel: "E-mail",
  },
};

const en: Dictionary = {
  common: {
    profile: "Profile",
    projects: "Projects",
    about: "About",
    months: [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
  },
  navbar: {
    experiences: "Experience",
    languageGroupLabel: "Choose language",
  },
  hero: {
    greeting: "Hey!",
    namePrefix: "My name is",
    cta: "See my projects",
    avatarAlt: "Photo of Corentin Bunaux",
  },
  profile: {
    title: "Profile",
    skillsTitle: "Skills",
    roleIntro: "Fullstack software engineer at ",
    roleClient: ", on assignment for ",
    roleLocation: ", based in ",
    educationIntro: "After completing ",
    cpgeTerm: "preparatory classes (CPGE)",
    educationMid1: ", I joined the École des ",
    educationMid2: ", through the ",
    educationOutro: " program, from which I graduated.",
    experienceSummary:
      "My previous professional experience allowed me to apply what I had learned academically, while developing new skills.",
    personality:
      "I am naturally curious, detail-oriented, and genuinely interested in new technologies.",
    seeProjects: "See the projects",
    languagesIntro: "I speak ",
    englishName: "English",
    englishLevel: " at a professional level (C1, TOEIC score: ",
    languagesMid: "), and ",
    spanishName: "Spanish",
    spanishLevel:
      " at an intermediate level (B1), in addition to my native language, ",
    frenchName: "French",
    toolsIntro:
      "A variety of school, personal, and professional projects have allowed me to become comfortable with the following software and programming languages.",
  },
  journey: {
    title: "Journey",
    currentBadge: "Current position",
    ongoingLabel: "today",
  },
  projects: {
    filterGroupLabel: "Filter projects by type",
    filters: {
      all: "All",
      pro: "Pro",
      recherche: "Research",
      ecole: "School",
      perso: "Personal",
    },
    previewComing: "Preview coming soon",
  },
  projectPage: {
    breadcrumbLabel: "Breadcrumb",
    home: "Home",
    context: "Context",
    gallery: "Gallery",
    visualAltPrefix: "Project visual for ",
    photoLabel: "photo",
    logoLabel: "Logo",
    enBref: "At a glance",
    role: "Role",
    duration: "Duration",
    team: "Team",
    stack: "Stack",
    result: "Result",
    viewRepo: "View the GitHub repository",
    navBetweenProjects: "Navigation between projects",
    prevProject: "Previous project",
    nextProject: "Next project",
    since: "Since",
    monthSingular: "month",
    monthPlural: "months",
  },
  about: {
    title: "About",
    tennisWord: "TENNIS",
    tennisIntro: "I have played ",
    tennisOutro:
      " since I was a child. I have had the opportunity to coach groups of students during competitive events.",
    tournaments:
      "For ten years, my ongoing participation in tournaments significantly strengthened my perseverance and competitive spirit.",
    otherSports:
      "More recently, I have taken up other sports such as climbing, swimming, and running.",
    interestsLabel: "Interests",
    pushButton: "PUSH!",
    interests: {
      tennis: "Tennis",
      climbing: "Climbing",
      swimming: "Swimming",
      running: "Running",
      chess: "Chess",
      videoGames: "Video games",
      sudoku: "Sudoku",
      code: "Code",
    },
  },
  footer: {
    workTogether: "Let's work together",
    availability:
      "Open to contract opportunities, based in Le Havre, on-site in La Défense, or remote.",
    contactCta: "Get in touch",
    navHeading: "Navigation",
    contactHeading: "Contact",
    emailLabel: "Email",
  },
};

export const dictionary = { fr, en };

/** Returns the dictionary for the currently active language. Must be called
 * from within a `LanguageProvider` (see `src/i18n/LanguageContext.tsx`). */
export function useTranslation(): Dictionary {
  const { language } = useLanguage();
  return dictionary[language];
}
