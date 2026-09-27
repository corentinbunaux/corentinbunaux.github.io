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
