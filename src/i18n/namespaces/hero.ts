export interface HeroDict {
  greeting: string;
  namePrefix: string;
  cta: string;
  avatarAlt: string;
}

export const heroFr: HeroDict = {
  greeting: "Hey !",
  namePrefix: "Je m'appelle",
  cta: "Voir mes projets",
  avatarAlt: "Photo de Corentin Bunaux",
};

export const heroEn: HeroDict = {
  greeting: "Hey!",
  namePrefix: "My name is",
  cta: "See my projects",
  avatarAlt: "Photo of Corentin Bunaux",
};
