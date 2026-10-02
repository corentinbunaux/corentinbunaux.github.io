import type { DemoId } from "../../components/demos/demoIds";

export interface DemoText {
  title: string;
  caption: string;
}

export interface DemosDict {
  sectionTitle: string;
  desktopOnly: string;
  items: Record<DemoId, DemoText>;
  spaceTime: {
    chartLabel: string;
    timeAxis: string;
    stopping: string;
    nonStop: string;
  };
}

export const demosFr: DemosDict = {
  sectionTitle: "Démo",
  desktopOnly:
    "Cette animation 3D s'affiche sur un écran large (1024 px et plus), si votre système ne demande pas de réduire les animations.",
  items: {
    "safran-earth": {
      title: "Un clin d'œil à l'aérospatial",
      caption:
        "Des satellites en orbite autour de la Terre, clin d'œil au secteur aérospatial de Safran — pas une reproduction de mon travail. Texture : NASA Blue Marble. Restez un peu : un visiteur inattendu finit par passer.",
    },
    "quimesis-fragments": {
      title: "Mes débuts en 3D",
      caption:
        "C'est pendant ce stage que j'ai découvert l'animation 3D : cette scène en garde la trace.",
    },
    "quimesis-jaw": {
      title: "Mâchoire interactive",
      caption:
        "Faites-la tourner en la faisant glisser, cliquez pour ouvrir ou fermer la mâchoire, survolez une dent pour la mettre en évidence. Modèle simplifié, généré par le code.",
    },
    "sncf-mini-train": {
      title: "Sur les rails",
      caption:
        "Un petit clin d'œil animé : c'est ce genre de circulation que les graphiques espace-temps ci-dessous représentent.",
    },
    "sncf-spacetime": {
      title: "Graphique espace-temps",
      caption:
        "Chaque trait est un train : le temps en abscisse, les gares en ordonnée. Plus la pente est forte, plus le train est rapide ; un palier est un arrêt. Données fictives.",
    },
    minesweeper: {
      title: "Démineur",
      caption:
        "Grille 9 × 9, 10 mines. Clic : révéler une case. Clic droit, appui long ou mode drapeau : marquer une mine.",
    },
    guards: {
      title: "Projet optimisation : les surveillants",
      caption:
        "Chaque surveillant voit toute sa ligne et toute sa colonne, jusqu'au premier mur. Couvrez toutes les cibles avec le moins de surveillants possible.",
    },
    typing: {
      title: "Dactylo Race — version solo",
      caption:
        "L'original se jouait à plusieurs en réseau (processus et threads en C). Cette version se joue seul, dans le navigateur : tapez la phrase le plus vite possible.",
    },
    predict: {
      title: "Dictionnaire de prédiction",
      caption:
        "Commencez à taper un mot : les suggestions viennent d'un petit dictionnaire classé par fréquence. Tab ou clic pour compléter.",
    },
    "parking-car": {
      title: "Créneau autonome",
      caption:
        "Un robot voiture longe une rangée, détecte une place libre avec son capteur puis s'y gare seul.",
    },
    "exo-arm": {
      title: "Bras d'exosquelette",
      caption:
        "Le moteur au coude assiste le bras : la charge monte, l'effort du porteur reste faible. " +
        "Les barres colorées à côté du bras traduisent cette assistance : vert pour le moteur, bleu pour l'effort du porteur.",
    },
  },
  spaceTime: {
    chartLabel:
      "Graphique espace-temps fictif : cinq trains entre les gares A et F sur deux heures.",
    timeAxis: "min",
    stopping: "Omnibus (arrêts en gare)",
    nonStop: "Direct",
  },
};

export const demosEn: DemosDict = {
  sectionTitle: "Demo",
  desktopOnly:
    "This 3D animation is shown on wide screens (1024 px and up), unless your system asks to reduce motion.",
  items: {
    "safran-earth": {
      title: "A nod to aerospace",
      caption:
        "Satellites orbiting Earth, a nod to Safran's aerospace sector — not a recreation of my actual work there. Texture: NASA Blue Marble. Stay a while: an unexpected visitor eventually flies by.",
    },
    "quimesis-fragments": {
      title: "My first steps in 3D",
      caption:
        "This internship is where I discovered 3D animation: this scene is a reminder of it.",
    },
    "quimesis-jaw": {
      title: "Interactive jaw",
      caption:
        "Drag to rotate, click to open or close the jaw, hover a tooth to highlight it. Simplified model, generated in code.",
    },
    "sncf-mini-train": {
      title: "On the rails",
      caption:
        "A small animated wink: this is the kind of movement the space-time diagram below represents.",
    },
    "sncf-spacetime": {
      title: "Space-time diagram",
      caption:
        "Each line is a train: time on the horizontal axis, stations on the vertical axis. The steeper the slope, the faster the train; a flat segment is a stop. Fictional data.",
    },
    minesweeper: {
      title: "Minesweeper",
      caption:
        "9 × 9 grid, 10 mines. Click: reveal a cell. Right-click, long press or flag mode: mark a mine.",
    },
    guards: {
      title: "Optimisation project: the guards",
      caption:
        "Each guard sees their whole row and column, up to the first wall. Cover every target with as few guards as possible.",
    },
    typing: {
      title: "Dactylo Race — solo version",
      caption:
        "The original was a networked multiplayer game (C processes and threads). This version is single-player, in the browser: type the sentence as fast as you can.",
    },
    predict: {
      title: "Predictive dictionary",
      caption:
        "Start typing a word: suggestions come from a small frequency-ranked dictionary. Tab or click to complete.",
    },
    "parking-car": {
      title: "Self-parking",
      caption:
        "A robot car drives along a row, detects a free spot with its sensor, then parks by itself.",
    },
    "exo-arm": {
      title: "Exoskeleton arm",
      caption:
        "The elbow motor assists the arm: the load goes up while the wearer's effort stays low. " +
        "The colored bars beside the arm show this: green for the motor, blue for the wearer's effort.",
    },
  },
  spaceTime: {
    chartLabel:
      "Fictional space-time diagram: five trains between stations A and F over two hours.",
    timeAxis: "min",
    stopping: "Stopping service",
    nonStop: "Non-stop",
  },
};
