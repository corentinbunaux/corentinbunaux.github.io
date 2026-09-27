import type { Language } from "../../i18n/types";

/** Short, punctuation-light sentences: the demo measures speed, not trivia. */
export const TYPING_SENTENCES: Record<Language, readonly string[]> = {
  fr: [
    "Le port du Havre voit passer des navires venus du monde entier.",
    "Un bon test automatique vaut mieux que dix relectures rapides.",
    "La balle de tennis frappe la ligne et le public se lève.",
    "Chaque ligne de code raconte une petite histoire.",
    "Le train quitte la gare à l'heure prévue malgré la pluie.",
    "Un satellite fait le tour de la Terre en quatre-vingt-dix minutes.",
    "Il faut savoir simplifier avant de chercher à optimiser.",
    "Le démineur se joue avec de la logique et un peu de chance.",
  ],
  en: [
    "The port of Le Havre welcomes ships from all over the world.",
    "One good automated test beats ten quick proofreads.",
    "The tennis ball clips the line and the crowd stands up.",
    "Every line of code tells a small story.",
    "The train leaves the station on time despite the rain.",
    "A satellite circles the Earth in about ninety minutes.",
    "Simplify first, then think about optimising.",
    "Minesweeper is played with logic and a little luck.",
  ],
};
