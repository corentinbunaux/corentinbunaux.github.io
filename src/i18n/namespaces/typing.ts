export interface TypingDict {
  inputLabel: string;
  placeholder: string;
  time: string;
  speed: string;
  wpm: string;
  accuracy: string;
  finished: string;
  newSentence: string;
}

export const typingFr: TypingDict = {
  inputLabel: "Tapez la phrase affichée",
  placeholder: "Commencez à taper ici…",
  time: "Temps",
  speed: "Vitesse",
  wpm: "mots/min",
  accuracy: "Précision",
  finished: "Arrivée ! {wpm} mots/min, {accuracy} % de précision.",
  newSentence: "Nouvelle phrase",
};

export const typingEn: TypingDict = {
  inputLabel: "Type the sentence shown",
  placeholder: "Start typing here…",
  time: "Time",
  speed: "Speed",
  wpm: "wpm",
  accuracy: "Accuracy",
  finished: "Finished! {wpm} wpm, {accuracy}% accuracy.",
  newSentence: "New sentence",
};
