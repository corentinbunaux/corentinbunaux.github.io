---
id: PORT-041
title: "Démo — dictionnaire de prédiction (autocomplétion par préfixe, apprentissage en session)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: in-progress
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-041-predict-demo
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Démo — dictionnaire de prédiction

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#12) et description du projet

Projet C d'école : un dictionnaire de prédiction qui propose des mots à
partir du début saisi par l'utilisateur. Accord de Corentin pour une démo.

Comportement retenu :
- on tape une phrase dans un champ ; le **dernier mot en cours** sert de
  préfixe ;
- jusqu'à **5 suggestions**, classées par : nombre de fois où le mot a été
  choisi pendant la visite (apprentissage, en mémoire seulement), puis rang
  dans la liste de fréquence ;
- la comparaison ignore majuscules et accents (« ete » propose « été ») ;
- Tab ou Entrée accepte la suggestion surlignée, flèches haut/bas pour
  changer, clic accepte ; le mot est remplacé et suivi d'une espace ;
- liste de mots selon la langue du site.

## Fichiers (uniquement ceux-ci)

- Créés : `src/components/demos/predictWords.ts`,
  `src/components/demos/predictLogic.ts`
- Remplacé : `src/components/demos/PredictDemo.tsx`
- Modifiés : `src/i18n/namespaces/predict.ts`, `registry.ts` (ligne `ready`
  de `predict`)

## Étapes

### 1. Listes de mots — `src/components/demos/predictWords.ts`

```ts
import type { Language } from "../../i18n/types";

/** Common words, most frequent first (approximate order). Lowercase, no duplicates. */
export const PREDICT_WORDS: Record<Language, readonly string[]> = {
  fr: [ /* 200 mots */ ],
  en: [ /* 200 words */ ],
};
```

Remplir chaque liste avec **200 mots courants** de la langue, du plus
fréquent au moins fréquent (ordre approximatif, c'est une démo), en
minuscules, **avec leurs accents** pour le français, sans doublon, en
privilégiant les mots de 4 lettres et plus (les mots de 1-2 lettres ne
servent à rien en autocomplétion). Inclure une dizaine de mots liés au
portfolio pour que la démo parle : FR `ingénieur, logiciel, projet,
programmation, dictionnaire, prédiction, satellite, train, tennis, réseau` ;
EN `engineer, software, project, programming, dictionary, prediction,
satellite, train, tennis, network`.

Contrôle doublons (doit afficher 200 puis 200) :

```bash
node --input-type=module -e "import('./src/components/demos/predictWords.ts').then(m=>{for(const l of ['fr','en'])console.log(new Set(m.PREDICT_WORDS[l]).size)})"
```

(Node 24 exécute le `.ts` ; un avertissement MODULE_TYPELESS est normal.)

### 2. Logique — `src/components/demos/predictLogic.ts`

```ts
export const MAX_SUGGESTIONS = 5;

/** Lowercase and strip diacritics, so "Ete" matches "été". */
export function fold(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

/** The word being typed: everything after the last space. */
export function currentWord(text: string): string {
  const lastSpace = text.lastIndexOf(" ");
  return text.slice(lastSpace + 1);
}

export function suggest(
  prefix: string,
  words: readonly string[],
  usage: ReadonlyMap<string, number>,
): string[] {
  const folded = fold(prefix);
  if (folded.length === 0) return [];
  return words
    .map((word, rank) => ({ word, rank, uses: usage.get(word) ?? 0 }))
    .filter(({ word }) => fold(word).startsWith(folded) && fold(word) !== folded)
    .sort((a, b) => b.uses - a.uses || a.rank - b.rank)
    .slice(0, MAX_SUGGESTIONS)
    .map(({ word }) => word);
}

/** Replaces the word being typed with `word` followed by a space. */
export function complete(text: string, word: string): string {
  const lastSpace = text.lastIndexOf(" ");
  return `${text.slice(0, lastSpace + 1)}${word} `;
}
```

### 3. Textes — `src/i18n/namespaces/predict.ts` (remplacer tout le fichier)

```ts
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
  placeholder: "Start a word, for example “prog”…",
  suggestionsLabel: "Suggestions",
  hint: "Tab or Enter: accept · ↑ ↓: change suggestion",
  learned: "Words learned during this visit: {count}",
};
```

### 4. Composant — `src/components/demos/PredictDemo.tsx` (remplacer tout le fichier)

```tsx
"use client";

import { useId, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useTranslation } from "../../i18n/dictionary";
import { PREDICT_WORDS } from "./predictWords";
import { complete, currentWord, suggest } from "./predictLogic";

function PredictBox() {
  const t = useTranslation();
  const { language } = useLanguage();
  const listId = useId();
  const [text, setText] = useState("");
  const [highlight, setHighlight] = useState(0);
  const [usage, setUsage] = useState<ReadonlyMap<string, number>>(new Map());

  const suggestions = suggest(currentWord(text), PREDICT_WORDS[language], usage);
  const active = Math.min(highlight, Math.max(suggestions.length - 1, 0));

  const accept = (word: string) => {
    setText(complete(text, word));
    setHighlight(0);
    setUsage((current) => new Map(current).set(word, (current.get(word) ?? 0) + 1));
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlight((active + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlight((active - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Tab" || event.key === "Enter") {
      event.preventDefault();
      accept(suggestions[active]);
    }
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm text-second-text">
        {t.predict.inputLabel}
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestions.length > 0}
          aria-controls={listId}
          aria-activedescendant={suggestions.length > 0 ? `${listId}-${active}` : undefined}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
          placeholder={t.predict.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="rounded-lg border border-second bg-surface px-3 py-2 text-base text-main-text"
        />
      </label>

      <ul
        id={listId}
        role="listbox"
        aria-label={t.predict.suggestionsLabel}
        className="flex min-h-[2.5rem] flex-wrap gap-2"
      >
        {suggestions.map((word, index) => (
          <li
            key={word}
            id={`${listId}-${index}`}
            role="option"
            aria-selected={index === active}
            onMouseDown={(event) => {
              event.preventDefault(); // keep focus in the input
              accept(word);
            }}
            className={`cursor-pointer rounded-full border px-3 py-1 text-sm ${
              index === active
                ? "border-my-green bg-my-green text-main"
                : "border-second bg-surface-raised text-main-text"
            }`}
          >
            {word}
          </li>
        ))}
      </ul>

      <p className="text-xs text-second-text">{t.predict.hint}</p>
      <p className="text-xs text-second-text">
        {t.predict.learned.replace("{count}", String(usage.size))}
      </p>
    </div>
  );
}

/** Keyed on language: switching language starts a fresh box with the other word list. */
export function PredictDemo() {
  const { language } = useLanguage();
  return <PredictBox key={language} />;
}
```

(Si tsc refuse `React.KeyboardEvent` sans import : `import type { KeyboardEvent } from "react";`
et typer `event: KeyboardEvent<HTMLInputElement>`.)

### 5. Activer — `registry.ts` : entrée `id: "predict"` uniquement, `ready: true`.

### 6. Vérifications

Procédure §4, puis `/emse/programming` :

1. Taper « prog » → « programmation » proposé ; Tab complète avec une espace.
2. Taper « ete » (FR) → « été » proposé (si présent dans la liste).
3. Choisir deux fois un mot moins fréquent pour un préfixe : il remonte en
   tête ; compteur « Mots appris » à jour.
4. Flèches haut/bas changent la suggestion surlignée ; clic accepte.
5. EN : liste anglaise.
6. 360 px et thèmes clair/sombre : lisible, pas de défilement horizontal.

Commit : `feat(demos): predictive dictionary autocomplete demo`

## Critères d'acceptation

- [ ] Suggestions par préfixe, insensibles aux accents, max 5.
- [ ] Apprentissage pendant la visite.
- [ ] Clavier complet (combobox accessible).
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

Rien.
