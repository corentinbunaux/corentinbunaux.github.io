export interface ProjectsDict {
  filterGroupLabel: string;
  filters: {
    all: string;
    pro: string;
    recherche: string;
    ecole: string;
    perso: string;
  };
  previewComing: string;
}

export const projectsFr: ProjectsDict = {
  filterGroupLabel: "Filtrer les projets par nature",
  filters: {
    all: "Tous",
    pro: "Pro",
    recherche: "Recherche",
    ecole: "École",
    perso: "Perso",
  },
  previewComing: "Aperçu à venir",
};

export const projectsEn: ProjectsDict = {
  filterGroupLabel: "Filter projects by type",
  filters: {
    all: "All",
    pro: "Pro",
    recherche: "Research",
    ecole: "School",
    perso: "Personal",
  },
  previewComing: "Preview coming soon",
};
