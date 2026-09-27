---
id: PORT-040
title: "Démo — Dactylo Race en version solo (vitesse et précision de frappe)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-040-typing-demo
depends_on: [PORT-031]
parallel_safe: true
human_checkpoint: "Faire une course en FR et une en EN."
created: 2026-09-27
---

# Démo — Dactylo Race solo

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#12)

> Pour dactylorace peut-être proposer un exemple en ligne ?

L'original (dépôt `dylan-bernhardt/dactylo-race`) est un jeu **multijoueur en
réseau** écrit en C (processus, threads, sockets) : impossible à héberger sur
un site statique. Accord de Corentin : **version solo** dans le navigateur.
La légende de la démo (PORT-031) l'explique déjà.

Règles : une phrase tirée au hasard dans la langue du site ; le chrono démarre
à la première touche ; la course se termine quand le texte saisi est
**exactement** la phrase ; on affiche le temps, la vitesse (mots/min, mot =
5 caractères) et la précision (frappes correctes / frappes totales). Coller
est interdit.

## Fichiers (uniquement ceux-ci)

- Créés : `src/components/demos/typingSentences.ts`
- Remplacé : `src/components/demos/TypingDemo.tsx`
- Modifiés : `src/i18n/namespaces/typing.ts`, `registry.ts` (ligne `ready`
  de `typing`)

## Étapes

### 1. Phrases — `src/components/demos/typingSentences.ts`

```ts
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
```

### 2. Textes — `src/i18n/namespaces/typing.ts` (remplacer tout le fichier)

```ts
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
```

### 3. Composant — `src/components/demos/TypingDemo.tsx` (remplacer tout le fichier)

```tsx
"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { useTranslation } from "../../i18n/dictionary";
import { TYPING_SENTENCES } from "./typingSentences";

function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key]));
}

function pickIndex(count: number, avoid: number): number {
  if (count < 2) return 0;
  let index = avoid;
  while (index === avoid) index = Math.floor(Math.random() * count);
  return index;
}

export function TypingDemo() {
  const t = useTranslation();
  const { language } = useLanguage();
  const sentences = TYPING_SENTENCES[language];
  const [sentenceIndex, setSentenceIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [keystrokes, setKeystrokes] = useState(0);
  const [errors, setErrors] = useState(0);

  const target = sentences[sentenceIndex % sentences.length];
  const running = startedAt !== null && finishedAt === null;

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [running]);

  const reset = (nextIndex: number) => {
    setSentenceIndex(nextIndex);
    setTyped("");
    setStartedAt(null);
    setFinishedAt(null);
    setKeystrokes(0);
    setErrors(0);
  };

  // A language switch changes the sentence list: start over.
  useEffect(() => {
    reset(0);
  }, [language]);

  const onChange = (value: string) => {
    if (finishedAt !== null) return;
    const timestamp = Date.now();
    if (startedAt === null) setStartedAt(timestamp);
    if (value.length > typed.length) {
      const added = value.slice(typed.length);
      let wrong = 0;
      for (let i = 0; i < added.length; i++) {
        if (added[i] !== target[typed.length + i]) wrong++;
      }
      setKeystrokes((k) => k + added.length);
      setErrors((e) => e + wrong);
    }
    setTyped(value);
    setNow(timestamp);
    if (value === target) setFinishedAt(timestamp);
  };

  const end = finishedAt ?? now;
  const seconds = startedAt === null ? 0 : Math.max(0, (end - startedAt) / 1000);
  const correctChars = [...typed].filter((char, i) => char === target[i]).length;
  const wpm = seconds > 0 ? Math.round(correctChars / 5 / (seconds / 60)) : 0;
  const accuracy = keystrokes > 0 ? Math.round(((keystrokes - errors) / keystrokes) * 100) : 100;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <p className="rounded-lg bg-surface-raised p-4 font-mono text-lg leading-relaxed" aria-hidden="true">
        {[...target].map((char, i) => {
          let className = "text-second-text";
          if (i < typed.length) className = typed[i] === char ? "text-my-green" : "bg-my-blue text-main";
          else if (i === typed.length) className = "text-main-text underline";
          return (
            <span key={i} className={className}>
              {char}
            </span>
          );
        })}
      </p>
      <p className="sr-only">{target}</p>

      <label className="flex flex-col gap-1 text-sm text-second-text">
        {t.typing.inputLabel}
        <input
          type="text"
          value={typed}
          onChange={(event) => onChange(event.target.value)}
          onPaste={(event) => event.preventDefault()}
          disabled={finishedAt !== null}
          placeholder={t.typing.placeholder}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="rounded-lg border border-second bg-surface px-3 py-2 font-mono text-base text-main-text"
        />
      </label>

      <dl className="grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <dt className="text-second-text">{t.typing.time}</dt>
          <dd className="font-semibold tabular-nums text-main-text">{seconds.toFixed(1)} s</dd>
        </div>
        <div>
          <dt className="text-second-text">{t.typing.speed}</dt>
          <dd className="font-semibold tabular-nums text-main-text">
            {wpm} {t.typing.wpm}
          </dd>
        </div>
        <div>
          <dt className="text-second-text">{t.typing.accuracy}</dt>
          <dd className="font-semibold tabular-nums text-main-text">{accuracy} %</dd>
        </div>
      </dl>

      <p aria-live="polite" className="min-h-[1.5rem] text-center text-sm font-semibold text-main-text">
        {finishedAt !== null && fill(t.typing.finished, { wpm, accuracy })}
      </p>

      <button
        type="button"
        onClick={() => reset(pickIndex(sentences.length, sentenceIndex))}
        className="mx-auto rounded-full border border-second px-4 py-1.5 text-sm text-main-text hover:bg-surface-raised"
      >
        {t.typing.newSentence}
      </button>
    </div>
  );
}
```

Si ESLint signale `react-hooks/exhaustive-deps` ou `set-state-in-effect` sur
l'effet `[language]` : remplacer cet effet par une remise à zéro dans le
rendu via une clé — dans `TypingDemo`, renommer le composant ci-dessus en
`TypingRace` (non exporté) et exporter
`export function TypingDemo() { const { language } = useLanguage(); return <TypingRace key={language} />; }`
en supprimant l'effet. C'est la solution préférée si le lint se plaint.

### 4. Activer — `registry.ts` : entrée `id: "typing"` uniquement, `ready: true`.

### 5. Vérifications

Procédure §4, puis `/emse/programming` :

1. Taper la phrase sans faute : chrono qui démarre à la 1ʳᵉ touche, message
   d'arrivée avec vitesse et 100 %.
2. Faire des fautes : lettres fautives surlignées, précision < 100 %.
3. Coller du texte : refusé.
4. « Nouvelle phrase » : autre phrase, compteurs à zéro.
5. Passer en EN : phrase anglaise, compteurs à zéro.
6. 360 px : la phrase passe à la ligne, champ utilisable au clavier mobile.
7. Clair et sombre lisibles.

Commit : `feat(demos): single-player Dactylo Race typing demo`

## Critères d'acceptation

- [ ] Course solo fonctionnelle, temps / vitesse / précision justes.
- [ ] Phrases FR et EN selon la langue du site.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

Rien.
