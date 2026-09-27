export interface AboutDict {
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
};
