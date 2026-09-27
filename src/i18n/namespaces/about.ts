export interface AboutDict {
  title: string;
  tennisWord: string;
  tennisIntro: string;
  tennisOutro: string;
  tournaments: string;
  otherSports: string;
  interestsLabel: string;
  activeLabel: string;
  archivedLabel: string;
  pushButton: string;
  interests: {
    tennis: string;
    climbing: string;
    swimming: string;
    running: string;
    chess: string;
    videoGames: string;
    code: string;
  };
}

export const aboutFr: AboutDict = {
  title: "À propos",
  tennisWord: "TENNIS",
  tennisIntro: "J'ai pratiqué le ",
  tennisOutro:
    " depuis que je suis enfant. J'ai eu l'opportunité d'entraîner des groupes d'élèves lors d'évènements compétitifs.",
  tournaments:
    "Pendant dix ans, ma constante participation à des tournois a renforcé ma persévérance et mon esprit de compétition de manière significative.",
  otherSports:
    "Je pratique aussi la course à pied. Pendant mes études, je me suis essayé à l'escalade, à la natation et aux échecs.",
  interestsLabel: "Centres d'intérêt",
  activeLabel: "Aujourd'hui",
  archivedLabel: "Archivées — pratiquées pendant mes études",
  pushButton: "PUSH !",
  interests: {
    tennis: "Tennis",
    climbing: "Escalade",
    swimming: "Natation",
    running: "Course",
    chess: "Échecs",
    videoGames: "Jeu vidéo",
    code: "Code",
  },
};

export const aboutEn: AboutDict = {
  title: "About",
  tennisWord: "TENNIS",
  tennisIntro: "I have played ",
  tennisOutro:
    " since I was a child. I have had the opportunity to coach groups of students during competitive events.",
  tournaments:
    "For ten years, my ongoing participation in tournaments significantly strengthened my perseverance and competitive spirit.",
  otherSports:
    "I also go running. During my studies, I tried my hand at climbing, swimming and chess.",
  interestsLabel: "Interests",
  activeLabel: "Today",
  archivedLabel: "Archived — tried during my studies",
  pushButton: "PUSH!",
  interests: {
    tennis: "Tennis",
    climbing: "Climbing",
    swimming: "Swimming",
    running: "Running",
    chess: "Chess",
    videoGames: "Video games",
    code: "Code",
  },
};
