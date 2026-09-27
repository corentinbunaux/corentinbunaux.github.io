export interface JourneyDict {
  title: string;
  currentBadge: string;
  ongoingLabel: string;
  experienceTrack: string;
  educationTrack: string;
}

export const journeyFr: JourneyDict = {
  title: "Parcours",
  currentBadge: "Poste actuel",
  ongoingLabel: "aujourd'hui",
  experienceTrack: "Expérience professionnelle",
  educationTrack: "Formation",
};

export const journeyEn: JourneyDict = {
  title: "Journey",
  currentBadge: "Current position",
  ongoingLabel: "today",
  experienceTrack: "Work experience",
  educationTrack: "Education",
};
