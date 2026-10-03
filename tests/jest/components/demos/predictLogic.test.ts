import { MAX_SUGGESTIONS, complete, currentWord, fold, suggest } from "../../../../src/components/demos/predictLogic";
import { PREDICT_WORDS } from "../../../../src/components/demos/predictWords";
import { TYPING_SENTENCES } from "../../../../src/components/demos/typingSentences";

describe("fold", () => {
  it("lowercases and strips diacritics", () => {
    expect(fold("Été")).toBe("ete");
    expect(fold("ÀBC")).toBe("abc");
  });
});

describe("currentWord", () => {
  it("returns the text after the last space", () => {
    expect(currentWord("bonjour le mon")).toBe("mon");
    expect(currentWord("seul")).toBe("seul");
    expect(currentWord("fin ")).toBe("");
  });
});

describe("suggest", () => {
  const words = ["maison", "magasin", "mail", "mais", "main", "mer", "ma", "mauvais"];

  it("returns nothing for an empty prefix", () => {
    expect(suggest("", words, new Map())).toEqual([]);
  });

  it("matches by prefix in list order, excludes the exact word, caps the list", () => {
    const result = suggest("ma", words, new Map());
    expect(result).toEqual(["maison", "magasin", "mail", "mais", "main"]);
    expect(result).toHaveLength(MAX_SUGGESTIONS);
    expect(result).not.toContain("ma");
  });

  it("ranks words used more often first", () => {
    const usage = new Map([
      ["mauvais", 3],
      ["mail", 1],
    ]);
    expect(suggest("ma", words, usage).slice(0, 2)).toEqual(["mauvais", "mail"]);
  });

  it("is accent-insensitive both ways", () => {
    expect(suggest("ec", ["école", "eclair"], new Map())).toEqual(["école", "eclair"]);
    expect(suggest("Éc", ["école"], new Map())).toEqual(["école"]);
  });
});

describe("complete", () => {
  it("replaces the current word and appends a space", () => {
    expect(complete("je vais à la mai", "maison")).toBe("je vais à la maison ");
    expect(complete("mai", "maison")).toBe("maison ");
  });
});

describe("word and sentence lists", () => {
  it.each(["fr", "en"] as const)("%s prediction list is lowercase and duplicate-free", (lang) => {
    const list = PREDICT_WORDS[lang];
    expect(list.length).toBeGreaterThan(50);
    expect(new Set(list).size).toBe(list.length);
    list.forEach((w) => expect(w).toBe(w.toLowerCase()));
  });

  it("has as many typing sentences in FR as in EN", () => {
    expect(TYPING_SENTENCES.fr.length).toBe(TYPING_SENTENCES.en.length);
    [...TYPING_SENTENCES.fr, ...TYPING_SENTENCES.en].forEach((s) => expect(s.trim()).toBe(s));
  });
});
