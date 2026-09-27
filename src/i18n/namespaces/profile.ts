export interface ProfileDict {
  roleIntro: string;
  roleClient: string;
  roleLocation: string;
  experienceSummary: string;
  personality: string;
}

export const profileFr: ProfileDict = {
  roleIntro: "Ingénieur logiciel fullstack chez ",
  roleClient: ", en prestation pour ",
  roleLocation: " depuis ",
  experienceSummary:
    "Mes précédentes expériences en entreprise m'ont permis d'appliquer mes acquis académiques, tout en développant de nouvelles compétences.",
  personality:
    "Je suis quelqu'un de naturellement curieux, avec le sens du détail, et qui porte un certain intérêt envers les nouvelles technologies.",
};

export const profileEn: ProfileDict = {
  roleIntro: "Fullstack software engineer at ",
  roleClient: ", on assignment for ",
  roleLocation: ", based in ",
  experienceSummary:
    "My previous professional experience allowed me to apply what I had learned academically, while developing new skills.",
  personality:
    "I am naturally curious, detail-oriented, and genuinely interested in new technologies.",
};
