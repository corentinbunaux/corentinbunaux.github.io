export interface PredictDict {
  inputLabel: string;
  placeholder: string;
  suggestionsLabel: string;
  hint: string;
  learned: string;
}

export const predictFr: PredictDict = {
  inputLabel: "Écrivez une phrase",
  placeholder: "Commencez un mot, par exemple « prog »…",
  suggestionsLabel: "Suggestions",
  hint: "Tab ou Entrée : accepter · ↑ ↓ : changer de suggestion",
  learned: "Mots appris pendant cette visite : {count}",
};

export const predictEn: PredictDict = {
  inputLabel: "Write a sentence",
  placeholder: "Start a word, for example \"prog\"…",
  suggestionsLabel: "Suggestions",
  hint: "Tab or Enter: accept · ↑ ↓: change suggestion",
  learned: "Words learned during this visit: {count}",
};
