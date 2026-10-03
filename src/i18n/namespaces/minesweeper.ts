export interface MinesweeperDict {
  gridLabel: string;
  minesLeft: string;
  time: string;
  flagMode: string;
  newGame: string;
  won: string;
  lost: string;
  cellHidden: string;
  cellFlagged: string;
  cellMine: string;
  cellEmpty: string;
}

export const minesweeperFr: MinesweeperDict = {
  gridLabel: "Grille du démineur, 9 lignes et 9 colonnes",
  minesLeft: "Mines restantes",
  time: "Temps",
  flagMode: "Mode drapeau",
  newGame: "Nouvelle partie",
  won: "Gagné en {seconds} s !",
  lost: "Perdu : une mine a explosé.",
  cellHidden: "Ligne {row}, colonne {col} : cachée",
  cellFlagged: "Ligne {row}, colonne {col} : drapeau",
  cellMine: "Ligne {row}, colonne {col} : mine",
  cellEmpty: "Ligne {row}, colonne {col} : {count} mine(s) autour",
};

export const minesweeperEn: MinesweeperDict = {
  gridLabel: "Minesweeper grid, 9 rows and 9 columns",
  minesLeft: "Mines left",
  time: "Time",
  flagMode: "Flag mode",
  newGame: "New game",
  won: "Won in {seconds} s!",
  lost: "Lost: a mine went off.",
  cellHidden: "Row {row}, column {col}: hidden",
  cellFlagged: "Row {row}, column {col}: flagged",
  cellMine: "Row {row}, column {col}: mine",
  cellEmpty: "Row {row}, column {col}: {count} mine(s) around",
};
