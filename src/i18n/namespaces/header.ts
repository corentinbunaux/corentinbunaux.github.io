export interface HeaderDict {
  homeLink: string;
  mainNavLabel: string;
  languageButtonLabel: string;
  /** Each language's name written in that language: identical in fr and en. */
  languageNames: { fr: string; en: string };
  themeToLight: string;
  themeToDark: string;
}

export const headerFr: HeaderDict = {
  homeLink: "Accueil",
  mainNavLabel: "Navigation principale",
  languageButtonLabel: "Changer de langue",
  languageNames: { fr: "Français", en: "English" },
  themeToLight: "Passer au thème clair",
  themeToDark: "Passer au thème sombre",
};

export const headerEn: HeaderDict = {
  homeLink: "Home",
  mainNavLabel: "Main navigation",
  languageButtonLabel: "Change language",
  languageNames: { fr: "Français", en: "English" },
  themeToLight: "Switch to light theme",
  themeToDark: "Switch to dark theme",
};
