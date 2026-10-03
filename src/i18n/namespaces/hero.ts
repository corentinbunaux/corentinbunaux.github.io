export interface HeroDict {
  greeting: string;
  namePrefix: string;
  cta: string;
  avatarAlt: string;
  tagline: string;
  stackLabel: string;
  languages: string;
  experienceLabel: string;
  linkedinLabel: string;
  githubLabel: string;
}

export const heroFr: HeroDict = {
  greeting: "Hey !",
  namePrefix: "Je m'appelle",
  cta: "Voir mes projets",
  avatarAlt: "Photo de Corentin Bunaux",
  tagline:
    "Ingénieur logiciel fullstack · Diplômé de l'École des Mines de Saint-Étienne",
  stackLabel: "Technos du quotidien",
  languages:
    "Anglais C1 (TOEIC 950/990) · Espagnol B1 · Français langue maternelle",
  experienceLabel: "Expériences chez",
  linkedinLabel: "Profil LinkedIn",
  githubLabel: "Profil GitHub",
};

export const heroEn: HeroDict = {
  greeting: "Hey!",
  namePrefix: "My name is",
  cta: "See my projects",
  avatarAlt: "Photo of Corentin Bunaux",
  tagline:
    "Fullstack software engineer · Graduate of the École des Mines de Saint-Étienne",
  stackLabel: "Everyday stack",
  languages: "English C1 (TOEIC 950/990) · Spanish B1 · French (native)",
  experienceLabel: "Experience at",
  linkedinLabel: "LinkedIn profile",
  githubLabel: "GitHub profile",
};
