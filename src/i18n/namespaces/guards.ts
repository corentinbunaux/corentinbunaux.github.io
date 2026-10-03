export interface GuardsDict {
  gridLabel: string;
  guardsCount: string;
  targetsCovered: string;
  showSolution: string;
  hideSolution: string;
  reset: string;
  allCovered: string;
  optimalReached: string;
  legendWall: string;
  legendTarget: string;
  legendGuard: string;
  cellLabel: string;
  kindWall: string;
  kindTarget: string;
  kindEmpty: string;
  withGuard: string;
  covered: string;
}

export const guardsFr: GuardsDict = {
  gridLabel: "Grille des surveillants, 10 lignes et 10 colonnes",
  guardsCount: "Surveillants",
  targetsCovered: "Cibles couvertes",
  showSolution: "Voir une solution optimale",
  hideSolution: "Revenir à ma grille",
  reset: "Tout effacer",
  allCovered: "Toutes les cibles sont couvertes avec {count} surveillants. L'optimum est {best}.",
  optimalReached: "Bravo, c'est optimal : {best} surveillants !",
  legendWall: "Mur",
  legendTarget: "Cible",
  legendGuard: "Surveillant",
  cellLabel: "Ligne {row}, colonne {col} : {kind}",
  kindWall: "mur",
  kindTarget: "cible",
  kindEmpty: "vide",
  withGuard: ", surveillant",
  covered: ", couverte",
};

export const guardsEn: GuardsDict = {
  gridLabel: "Guards grid, 10 rows and 10 columns",
  guardsCount: "Guards",
  targetsCovered: "Targets covered",
  showSolution: "Show an optimal solution",
  hideSolution: "Back to my grid",
  reset: "Clear all",
  allCovered: "Every target is covered with {count} guards. The optimum is {best}.",
  optimalReached: "Well done, that's optimal: {best} guards!",
  legendWall: "Wall",
  legendTarget: "Target",
  legendGuard: "Guard",
  cellLabel: "Row {row}, column {col}: {kind}",
  kindWall: "wall",
  kindTarget: "target",
  kindEmpty: "empty",
  withGuard: ", guard",
  covered: ", covered",
};
