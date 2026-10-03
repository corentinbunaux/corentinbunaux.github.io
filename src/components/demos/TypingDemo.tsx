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

function TypingRace() {
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

export function TypingDemo() {
  const { language } = useLanguage();
  return <TypingRace key={language} />;
}
