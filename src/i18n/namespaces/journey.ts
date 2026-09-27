export interface JourneyDict {
  title: string;
  currentBadge: string;
  ongoingLabel: string;
}

export const journeyFr: JourneyDict = {
  title: "Parcours",
  currentBadge: "Poste actuel",
  ongoingLabel: "aujourd'hui",
};

export const journeyEn: JourneyDict = {
  title: "Journey",
  currentBadge: "Current position",
  ongoingLabel: "today",
};
