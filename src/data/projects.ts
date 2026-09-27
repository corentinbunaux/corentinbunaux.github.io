/**
 * Single source of truth for the portfolio's projects.
 *
 * Extracted from `src/components/projectsSection.jsx` (PORT-008). Both the
 * portfolio grid (`projectsSection.jsx`) and the project page
 * (`project.tsx`) read from here.
 *
 * Bilingual fields (PORT-017): every field that holds real prose (`title`,
 * `description`, `role`, `result`, `pageContent.context`,
 * `pageContent.mainPart[].title/description`) is a `LocalizedText` — an
 * `{ fr, en }` pair — rather than a plain string, so both languages live next
 * to each other in one file instead of a parallel `projects.en.ts` that could
 * drift out of sync. Consumers call `localizeProject(project, language)` to
 * get back the same flat shape the components used before this ticket
 * (`title: string`, etc.), which is what keeps `ProjectPage.tsx`,
 * `projectsSection.jsx` and `journeySection.tsx` simple to read from.
 */

import type { Language, LocalizedText } from "../i18n/types";

/**
 * Identifiers of the technology logos rendered by `bannerElmts` in
 * `src/components/Banner.jsx`. That module resolves each id and silently drops
 * the ones it does not know, so an unknown id would vanish without warning —
 * hence the closed union, which turns that silent drop into a type error.
 *
 * Keep in sync with `bannerElmts`.
 */
export type TechLogoId =
  | "html"
  | "css"
  | "javascript"
  | "react"
  | "typescript"
  | "kotlin"
  | "sql"
  | "python"
  | "java"
  | "cpp"
  | "arduino"
  | "windows"
  | "linux"
  | "office"
  | "git";

/**
 * When a project ran. Months are `YYYY-MM`.
 *
 * A discriminated union rather than an optional `end`: an ongoing project has
 * no end date, and a finished one always has one. Modelling it this way means
 * "finished but no end date" cannot be written down.
 */
export type ProjectPeriod =
  | { readonly status: "ongoing"; readonly start: string }
  | { readonly status: "completed"; readonly start: string; readonly end: string };

/** One titled block of prose in the body of a project page. */
export interface ProjectSection {
  readonly title: LocalizedText;
  readonly description: LocalizedText;
}

/** The long-form content of a project page. */
export interface ProjectPageContent {
  readonly context: LocalizedText;
  readonly mainPart: readonly ProjectSection[];
}

/**
 * Broad grouping used by the projects section filter (PORT-011): Pro
 * (employment — jobs and internships), Recherche, École (coursework, incl.
 * classes préparatoires) and Perso (personal projects with no institution
 * behind them).
 */
export type ProjectCategory = "pro" | "recherche" | "ecole" | "perso";

export interface Project {
  /** Entity or project name, shown on the card and as the page heading. */
  readonly title: LocalizedText;
  /** Route without a leading slash, e.g. `internships/safran`. */
  readonly href: string;
  /** One-line subtitle shown under the title. */
  readonly description: LocalizedText;
  readonly category: ProjectCategory;
  /** Logo of the company or school, or `null` for personal projects. */
  readonly entityLogo: string | null;
  /** Public repository URL, or `null` when there is none. */
  readonly githubRepo: string | null;
  readonly techLogos: readonly TechLogoId[];
  /** Card background image, or `null` when no visual is available. */
  readonly img: string | null;
  /** Carousel images; empty when there are none. */
  readonly photos: readonly string[];
  /** Omitted where the dates are not confirmed. */
  readonly period?: ProjectPeriod;
  /** Omitted where the location is not confirmed. Not translated: place
   * names are kept as-is in both languages (see PORT-017's ticket). */
  readonly location?: string;
  /** Set only on the one project shown as the double-width highlighted card. */
  readonly featured?: true;
  /**
   * Short role/title shown in the project page's "En bref" summary card.
   * Omitted where not yet authored (see PORT-012's ticket refinement).
   */
  readonly role?: LocalizedText;
  /** Team size or composition shown in "En bref". Omitted where not known. */
  readonly team?: string;
  /** Headline outcome shown in "En bref". Omitted where not yet authored. */
  readonly result?: LocalizedText;
  readonly pageContent: ProjectPageContent;
}

/** `Project`, with every `LocalizedText` field resolved to a plain string for
 * one language — the shape every display component actually consumes. */
export type LocalizedProject = Omit<
  Project,
  "title" | "description" | "role" | "result" | "pageContent"
> & {
  readonly title: string;
  readonly description: string;
  readonly role?: string;
  readonly result?: string;
  readonly pageContent: {
    readonly context: string;
    readonly mainPart: readonly {
      readonly title: string;
      readonly description: string;
    }[];
  };
};

/** Resolves every bilingual field of `project` to the given `language`. */
export function localizeProject(
  project: Project,
  language: Language
): LocalizedProject {
  return {
    ...project,
    title: project.title[language],
    description: project.description[language],
    role: project.role ? project.role[language] : undefined,
    result: project.result ? project.result[language] : undefined,
    pageContent: {
      context: project.pageContent.context[language],
      mainPart: project.pageContent.mainPart.map((part) => ({
        title: part.title[language],
        description: part.description[language],
      })),
    },
  };
}

export const projects = [
  {
    title: { fr: "GCII / Enedis", en: "GCII / Enedis" },
    href: "work/gcii",
    description: {
      fr: "Ingénieur logiciel fullstack",
      en: "Fullstack Software Engineer",
    },
    category: "pro",
    featured: true,
    entityLogo: null,
    githubRepo: null,
    techLogos: ["python", "react"],
    img: "/img/gcii-grid",
    photos: [],
    period: { status: "ongoing", start: "2025-11" },
    location: "Le Havre",
    role: {
      fr: "Ingénieur logiciel fullstack — refonte d'une application métier",
      en: "Fullstack Software Engineer — rebuilding a business application",
    },
    result: {
      fr: "Refonte en cours d'une application métier utilisée par plus de 10 000 utilisateurs chez Enedis, avec migration du socle historique PHP vers Django et React.",
      en: "Ongoing rebuild of a business application used by more than 10,000 users at Enedis, migrating the legacy PHP stack to Django and React.",
    },
    pageContent: {
      context: {
        fr: "Depuis novembre 2025, je suis ingénieur logiciel fullstack chez GCII, en prestation pour Enedis, au Havre. Il s'agit de mon premier poste, à l'issue de trois stages. J'interviens sur la refonte d'une application métier utilisée par plus de 10 000 utilisateurs.",
        en: "Since November 2025, I have been working as a fullstack software engineer at GCII, on assignment for Enedis, in Le Havre. This is my first full-time position, following three internships. I work on rebuilding a business application used by more than 10,000 users.",
      },
      mainPart: [
        {
          title: {
            fr: "Refonte d'une application à large échelle",
            en: "Rebuilding a large-scale application",
          },
          description: {
            fr: "L'application sur laquelle j'interviens est utilisée quotidiennement par plus de 10 000 utilisateurs chez Enedis. Le chantier consiste à la reconstruire, en conservant les fonctionnalités métier existantes tout en repensant l'architecture et l'expérience utilisateur. Le nombre d'utilisateurs impose une attention particulière à la continuité de service : la bascule doit se faire sans interrompre les équipes qui s'appuient sur l'outil au quotidien.",
            en: "The application I work on is used daily by more than 10,000 users at Enedis. The project consists of rebuilding it, preserving the existing business functionality while rethinking the architecture and user experience. The number of users demands particular attention to service continuity: the switch-over has to happen without disrupting the teams who rely on the tool every day.",
          },
        },
        {
          title: {
            fr: "Migration de PHP vers Django et React",
            en: "Migrating from PHP to Django and React",
          },
          description: {
            fr: "Le socle historique est écrit en PHP. La refonte s'appuie sur un backend Django et un frontend React, ce qui suppose de réécrire la logique métier, de redéfinir les interfaces entre le serveur et le client, et de reprendre le modèle de données existant. Ce travail couvre autant la traduction du code en place que la mise en place des conventions et de l'outillage du nouveau socle.",
            en: "The legacy stack is written in PHP. The rebuild is based on a Django backend and a React frontend, which means rewriting the business logic, redefining the interfaces between server and client, and reworking the existing data model. This covers both translating the existing code and setting up the conventions and tooling for the new stack.",
          },
        },
        {
          title: { fr: "Un projet en cours", en: "An ongoing project" },
          description: {
            fr: "Ce poste est mon premier emploi, après trois stages (Kusmi Tea, Quimesis et Safran Data Systems). La refonte est toujours en cours : cette page en décrit la portée et les choix techniques, et sera complétée au fur et à mesure de son avancement.",
            en: "This position is my first job, after three internships (Kusmi Tea, Quimesis, and Safran Data Systems). The rebuild is still ongoing: this page describes its scope and technical choices, and will be updated as it progresses.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Safran", en: "Safran" },
    href: "internships/safran",
    description: { fr: "Stage de fin d'études", en: "Final-year internship" },
    category: "pro",
    entityLogo: "/logos/safran",
    githubRepo: null,
    techLogos: ["typescript", "react", "git", "linux"],
    img: "/img/safran",
    photos: [],
    period: { status: "completed", start: "2025-04", end: "2025-09" },
    role: {
      fr: "Développeur logiciel — frameworks & outils internes",
      en: "Software Developer — internal frameworks & tooling",
    },
    result: {
      fr: "Framework et CLI adoptés pour la génération de nouveaux projets par plusieurs équipes internes.",
      en: "Framework and CLI adopted by several internal teams for generating new projects.",
    },
    pageContent: {
      context: {
        fr: "Lors de ma dernière année aux Mines de Saint-Etienne, j'ai eu l'opportunité de réaliser un stage de fin d'études au sein de l'entreprise Safran Data Systems. Ce stage m'a permis de m'immerger dans le monde spatial et de travailler sur des outils internes pour différentes équipes, ainsi qu'une application cliente.",
        en: "During my final year at Mines de Saint-Étienne, I had the opportunity to complete my final-year internship at Safran Data Systems. This internship let me immerse myself in the space industry and work on internal tools for several teams, as well as a client application.",
      },
      mainPart: [
        {
          title: {
            fr: "Réalisation d'un benchmark",
            en: "Running a benchmark",
          },
          description: {
            fr: "Afin de choisir les technologies les plus adaptées aux projets backend Safran, j'ai été amené à réaliser un état de l'art des solutions d'API RESTful, et un comparatif des performances de différents frameworks pour ces projets. Puis, après présentation des résultats aux différentes équipes, j'ai pu développer un framework complet pour les besoins de l'entreprise à partir de la solution optimale retenue.",
            en: "To choose the technologies best suited to Safran's backend projects, I carried out a state-of-the-art review of RESTful API solutions and a performance comparison of different frameworks for these projects. After presenting the results to the various teams, I was able to build a complete framework for the company's needs, based on the optimal solution chosen.",
          },
        },
        {
          title: { fr: "Mise en place d'un CLI", en: "Building a CLI" },
          description: {
            fr: "Après finalisation du framework, j'ai travaillé sur la mise en place d'une interface en ligne de commande (CLI) pour faciliter l'utilisation du framework nouvellement créé. Ce CLI permet aux utilisateurs de générer des projets rapidement, et d'intégrer facilement différentes fonctionnalités à un projet. Le déploiement du CLI sur le registry Safran a permis à différentes équipes de l'utiliser intuitivement.",
            en: "After finalizing the framework, I worked on building a command-line interface (CLI) to make the newly created framework easier to use. This CLI lets users generate projects quickly and easily integrate various features into a project. Deploying the CLI to Safran's internal registry allowed different teams to use it intuitively.",
          },
        },
        {
          title: {
            fr: "Utilisation du framework pour différents projets",
            en: "Using the framework across different projects",
          },
          description: {
            fr: "Finalement, j'ai pu tester le framework sur plusieurs projets internes, ce qui a permis de valider son efficacité et sa flexibilité. J'ai ainsi pu améliorer certaines fonctionnalités, et en ajouter de nouvelles grâce à des cas concrets d'utilisation.",
            en: "Finally, I was able to test the framework on several internal projects, which validated its effectiveness and flexibility. This let me improve some features and add new ones based on concrete use cases.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "SNCF", en: "SNCF" },
    href: "research/sncf",
    description: { fr: "Projet de recherche", en: "Research project" },
    category: "recherche",
    entityLogo: "/logos/sncf",
    githubRepo: "https://github.com/corentinbunaux/projet-recherche-SNCF",
    techLogos: ["java", "git"],
    img: "/img/sncf",
    photos: [],
    pageContent: {
      context: {
        fr: "Ce projet faisait office de projet de fin d'études à l'école des Mines. Il avait pour objectif de répondre à un besoin spécifique de la SNCF en matière de recherche et d'innovation. Par groupe de 4 étudiants, nous avons travaillé durant 1 mois sur l'optimisation d'un problème de génération de trajets propre à la SNCF.",
        en: "This project served as a capstone project at the Mines de Saint-Étienne. Its goal was to address a specific research and innovation need for SNCF. In a group of 4 students, we spent 1 month optimizing a route-generation problem specific to SNCF.",
      },
      mainPart: [
        {
          title: { fr: "Problématique", en: "Problem statement" },
          description: {
            fr: "Afin de représenter les différents trajets possibles sur les lignes de chemins de fer, la SNCF se munie de Graphiques Espace Temps, qui permettent de représenter l'utilisation des différentes lignes par différents trains, en fonction du temps. Un des problèmes les plus ennuyeux de ce système est la lisibilité de ces graphiques. En effet, plus un grand nombre de gares sont représentées, moins il est aisé de lire le graphique. Ainsi le projet qui nous a été confié était un projet d'optimisation de ces graphiques.",
            en: "To represent the various possible routes on its railway lines, SNCF uses space-time diagrams, which show how different trains use the various lines over time. One of the most persistent problems with this system is the readability of these diagrams: the more stations represented, the harder the diagram is to read. The project we were given was therefore about optimizing these diagrams.",
          },
        },
        {
          title: { fr: "Solution envisagée", en: "Proposed solution" },
          description: {
            fr: "Nous avons proposé de solutionner ce problème en repensant la manière dont les trajets étaient générés sur ces graphiques. Nous avons utilisé la topologie du réseau de chemins de fer pour optimiser la représentation des trajets. Cette première solution a permis de réduire le nombre de gares représentées sur chaque graphique, améliorant ainsi leur lisibilité. Néanmoins, il restait encore des améliorations à apporter, puisque cette représentation était trop éloignée de la réalité terrain.",
            en: "We proposed solving this problem by rethinking how routes were generated on these diagrams. We used the topology of the railway network to optimize how routes were represented. This first solution reduced the number of stations shown on each diagram, improving readability. However, there was still room for improvement, since this representation was too far removed from what happens on the ground.",
          },
        },
        {
          title: { fr: "Solution améliorée", en: "Improved solution" },
          description: {
            fr: "Nous avons affiné notre approche en intégrant les flux de trafic réels dans notre modèle. Ainsi, la génération des trajets tenait compte des flux réels des trains sur une voie donnée. Cette nouvelle approche a permis d'améliorer significativement la pertinence des trajets générés, en les rendant plus réalistes et exploitables, mais en détériorant la lisibilité des graphiques. Finalement, notre solution a tout de même amélioré la situation en proposant des graphiques plus clairs et plus informatifs, en réduisant par 3 (en moyenne) le nombre de gares représentées.",
            en: "We refined our approach by incorporating real traffic flows into our model, so that route generation accounted for the actual flow of trains on a given track. This new approach significantly improved the relevance of the generated routes, making them more realistic and usable, though it did reduce diagram readability somewhat. In the end, our solution still improved the situation by producing clearer, more informative diagrams, reducing the number of stations represented by a factor of 3 on average.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "CCTV", en: "CCTV" },
    href: "personnal/cctv",
    description: {
      fr: "Projet de vidéo surveillance",
      en: "Video surveillance project",
    },
    category: "perso",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["arduino", "python", "react"],
    img: "/img/cctv",
    photos: [],
    pageContent: {
      context: {
        fr: "En guise de projet personnel en parallèle des cours de dernière année aux Mines, je me suis lancé dans le développement d'un système de vidéo surveillance, accessible en ligne.",
        en: "As a personal project alongside my final-year coursework at Mines de Saint-Étienne, I set out to build an online-accessible video surveillance system.",
      },
      mainPart: [
        {
          title: {
            fr: "Développement du montage",
            en: "Building the hardware setup",
          },
          description: {
            fr: "J'ai conçu et assemblé les différents composants matériels nécessaires au fonctionnement du système, grâce notamment à des cartes Arduino et ESP32. L'idée principale du montage était d'avoir une carte Arduino centrale, qui gérait l'ensemble des informations qui lui étaient transmises. Différents capteurs étaient connectés afin de récolter des données sur l'environnement (lumière, mouvement, son). Puis, cette carte principale communiquait avec les autres ESP32 via bluetooth, pour récupérer les flux vidéo ou photos qui étaient capturés. J'ai notamment utilisé un capteur PIR pour détécter quand prendre une photo (cas d'une intrusion dans le domicile).",
            en: "I designed and assembled the hardware components needed for the system, mainly using Arduino and ESP32 boards. The core idea was to have a central Arduino board manage all the information sent to it. Various sensors were connected to collect environmental data (light, motion, sound). This central board then communicated with the other ESP32 boards over Bluetooth to retrieve the captured video feeds or photos. In particular, I used a PIR sensor to detect when to take a photo (in the event of an intrusion at home).",
          },
        },
        {
          title: { fr: "Développement d'une API", en: "Building an API" },
          description: {
            fr: "Par la suite, j'ai développé une API RESTful en Django pour permettre à l'application de communiquer avec le système de vidéo surveillance. Cette API gérait les requêtes des utilisateurs, telles que l'authentification, la récupération des flux vidéo et la gestion des paramètres de sécurité. Toutes les requêtes étaient effectuées par la carte Arduino, de façon autonome, afin de stocker les photos prises ou les données récupérées.",
            en: "I then built a RESTful API in Django to let the application communicate with the surveillance system. This API handled user requests such as authentication, retrieving video feeds, and managing security settings. All requests were made autonomously by the Arduino board, to store the photos taken or the data collected.",
          },
        },
        {
          title: {
            fr: "Développement d'une interface utilisateur",
            en: "Building a user interface",
          },
          description: {
            fr: "Enfin, j'ai développé une interface utilisateur en React pour permettre aux utilisateurs d'interagir avec le système de vidéo surveillance. Cette interface affichait les photos prises sous forme de visionneuse en ligne, et offrait une vue d'ensemble des données collectées par les capteurs.",
            en: "Finally, I built a user interface in React to let users interact with the surveillance system. This interface displayed the photos taken in an online viewer and provided an overview of the data collected by the sensors.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Android", en: "Android" },
    href: "emse/android",
    description: {
      fr: "Développement d'une application mobile",
      en: "Mobile application development",
    },
    category: "ecole",
    img: "/img/android",
    entityLogo: "/logos/emse",
    githubRepo: null,
    techLogos: ["kotlin", "typescript", "git"],
    photos: [],
    pageContent: {
      context: {
        fr: "Lors de ma dernière année à l'école des Mines, un cours de développement web nous a permis de travailler sur un projet de création d'une application mobile. En binômes, nous avons choisi de développer une application de visualisation des radars automobiles.",
        en: "During my final year at Mines de Saint-Étienne, a web development course had us work on building a mobile application. In pairs, we chose to build an app for visualizing speed camera locations.",
      },
      mainPart: [
        {
          title: { fr: "Création d'une API", en: "Building an API" },
          description: {
            fr: "Pour permettre à notre application d'accéder aux données des radars, nous avons dû créer une API RESTful. Cette API était responsable de la gestion des données des radars, y compris leur ajout, leur suppression et leur mise à jour. Nous avons utilisé le framework NestJS pour ce faire, et avons recueilli des données publiques pour peupler l'API.",
            en: "To let our application access speed camera data, we had to build a RESTful API. This API was responsible for managing the camera data, including adding, removing, and updating entries. We used the NestJS framework for this, and gathered public data to populate the API.",
          },
        },
        {
          title: { fr: "Interface Android", en: "Android interface" },
          description: {
            fr: "En parallèle, une interface Android a été développée en utilisant Kotlin, sous l'IDE Android Studio. Cette interface permettait aux utilisateur d'interagir avec l'application par le biais de différents menus, notamment une liste déroulante des radars, depuis laquelle des détails étaient accessibles, ainsi qu'une carte affichant leur répartition géographique.",
            en: "In parallel, an Android interface was built using Kotlin in the Android Studio IDE. This interface let users interact with the app through various menus, including a scrollable list of speed cameras with accessible details, as well as a map showing their geographic distribution.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Démineur", en: "Minesweeper" },
    href: "emse/minesweeper",
    description: {
      fr: "Développement d'un jeu de démineur",
      en: "Building a minesweeper game",
    },
    category: "ecole",
    img: "/img/minesweeper",
    entityLogo: "/logos/emse",
    githubRepo: "https://github.com/corentinbunaux/minesweeper",
    techLogos: ["java"],
    photos: [],
    pageContent: {
      context: {
        fr: "Dans le cadre de ma formation en école d'ingénieur, j'ai eu l'opportunité de travailler sur un projet de développement d'un jeu du démineur, qui accompagnait un cours sur le développement Java.",
        en: "As part of my engineering degree, I had the opportunity to work on building a minesweeper game, as a companion project to a course on Java development.",
      },
      mainPart: [
        {
          title: { fr: "Partie classique", en: "Classic mode" },
          description: {
            fr: "Dans un premier temps, j'ai développé la logique du jeu traditionnel, ainsi qu'une interface graphique simple avec la librairie Swing. Le but de ce cours était avant tout de se concentrer sur les aspects backend de l'app. Plusieurs grilles de différents niveaux étaient générées de manière aléatoire, avec un nombre fixé de bombes pour chacun. La propagation lors du clic sur une case vide était active.",
            en: "First, I implemented the logic of the traditional game, along with a simple graphical interface using the Swing library. The point of the course was mainly to focus on the app's backend. Several grids of different difficulty levels were generated randomly, each with a fixed number of mines. Flood-fill propagation when clicking an empty cell was enabled.",
          },
        },
        {
          title: { fr: "Jeu multijoueur", en: "Multiplayer mode" },
          description: {
            fr: "Dans un second temps, j'ai ajouté une fonctionnalité de jeu multijoueur, permettant à plusieurs utilisateurs de se connecter et de jouer ensemble. J'ai utilisé des sockets pour gérer la communication entre les clients et le serveur, et j'ai dû repenser certaines parties de la logique du jeu pour gérer les interactions entre les joueurs. La propagation du clic sur une case vide était cette fois-ci désactivée, car les règles du jeu multijoueur différaient de celles du jeu classique. Dans ce mode, 1 clic correspondait à 1 point, et le but était d'obtenir le maximum de points sur une grille, sans cliquer sur une bombe (le joueur était éliminé auquel cas).",
            en: "Next, I added a multiplayer feature, letting several users connect and play together. I used sockets to handle communication between clients and the server, and had to rethink parts of the game logic to handle interactions between players. Flood-fill propagation on an empty cell was disabled this time, since the multiplayer rules differed from the classic game. In this mode, each click was worth 1 point, and the goal was to score as many points as possible on a grid without clicking a mine (which would eliminate the player).",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Quimesis", en: "Quimesis" },
    href: "internships/quimesis",
    description: {
      fr: "Stage d'ingénierie logicielle",
      en: "Software engineering internship",
    },
    category: "pro",
    img: "/img/quimesis",
    entityLogo: "/logos/quimesis",
    githubRepo: null,
    techLogos: ["cpp", "react", "git", "linux"],
    photos: ["/img/quimesis-1", "/img/quimesis-2", "/img/quimesis-3"],
    period: { status: "completed", start: "2024-04", end: "2024-07" },
    location: "Belgique",
    pageContent: {
      context: {
        fr: "Dans le cadre de ma seconde année d'école d'ingénieur, j'ai eu l'opportunité de réaliser un stage d'ingénierie logicielle chez Quimesis, une entreprise Belge spécialisée dans trois domaines : la mécanique, l'électronique et l'informatique. J'ai été amené à travailler sur un projet informatique dans le domaine médical.",
        en: "As part of my second year of engineering school, I had the opportunity to complete a software engineering internship at Quimesis, a Belgian company specializing in three fields: mechanics, electronics, and computer science. I worked on a software project in the medical field.",
      },
      mainPart: [
        {
          title: {
            fr: "Amélioration d'algorithmes de segmentation dentaire",
            en: "Improving dental segmentation algorithms",
          },
          description: {
            fr: "La première étape de ce stage a consisté à améliorer les algorithmes de segmentation dentaire, qui permettent de séparer une dent de ses voisines et de la gencive. Pour cela, j'ai utilisé la librairie VTK en C++, qui permet de manipuler des images 3D. J'ai ajouté une fonctionnalité permettant de déplacer les points de la frontière entre une dent et ses voisines / la gencive (calculée mathématiquement), afin de retracer cette même frontière à la main, de manière précise.",
            en: "The first step of this internship was to improve the dental segmentation algorithms, which separate a tooth from its neighbors and from the gum. For this, I used the VTK library in C++, which is used to manipulate 3D images. I added a feature that lets the boundary points between a tooth and its neighbors/gum (computed mathematically) be moved, so that this boundary can be manually retraced with precision.",
          },
        },
        {
          title: {
            fr: "Développement d'une application web",
            en: "Building a web application",
          },
          description: {
            fr: "Dans un but de faciliter l'intégration du logiciel de segmentation dentaire dans le quotidien des dentistes, j'ai développé une application web en React.js, intégrant la librarie VTK. Cette application permet de visualiser les images 3D des dents, de les segmenter, et de les exporter, le tout depuis un navigateur web. Elle est également dotée de fonctionnalités de visualisation supplémentaires. Cette étape m'a permis de comprendre les principes de fonctionnement d'applications full-stack.",
            en: "To make it easier to integrate the dental segmentation software into dentists' everyday workflow, I built a web application in React.js, integrating the VTK library. This application allows 3D tooth images to be viewed, segmented, and exported, all from a web browser. It also includes additional visualization features. This step helped me understand how full-stack applications work.",
          },
        },
        {
          title: {
            fr: "Mise en place d'un environnement de développement optimisé",
            en: "Setting up an optimized development environment",
          },
          description: {
            fr: 'Afin que mon travail puisse être repris par les développeurs de l\'entreprise, j\'ai mis en place un environnement de développement optimisé. Pour cela, j\'ai utilisé WebAssembly, qui permet de compiler du code C++ en code JavaScript. Dans un premier temps, cette technologie permettait d\'optimiser la fluidité du rendu de l\'application. Par la suite, j\'ai mis en place un environnement de "Hot-Reload" qui permet de recharger automatiquement l\'application lorsqu\'un changement est effectué dans le code source, sans recompilation complète du C++. ',
            en: 'So that my work could be picked up by the company\'s developers, I set up an optimized development environment. For this, I used WebAssembly, which compiles C++ code into JavaScript. Initially, this technology helped optimize the smoothness of the application\'s rendering. I then set up a "hot-reload" environment that automatically reloads the application whenever a change is made to the source code, without a full C++ recompilation.',
          },
        },
      ],
    },
  },
  {
    title: { fr: "Kusmi Tea", en: "Kusmi Tea" },
    href: "internships/kusmitea",
    description: { fr: "Stage ouvrier", en: "Manual labor internship" },
    category: "pro",
    img: "/img/kusmitea",
    entityLogo: "/logos/kusmi-tea",
    githubRepo: null,
    photos: ["/img/kusmi-1"],
    techLogos: [],
    period: { status: "completed", start: "2023-01", end: "2023-01" },
    location: "Normandie",
    pageContent: {
      context: {
        fr: "Durant ma première année d'école d'ingénieur, j'ai réalisé un stage ouvrier chez Kusmi Tea, entreprise spécialisée dans l'import/export et la vente de thé. J'ai été amené à travailler sur la chaîne de production, et au support informatique.",
        en: "During my first year of engineering school, I completed a manual labor internship at Kusmi Tea, a company specializing in the import/export and sale of tea. I worked on the production line and in IT support.",
      },
      mainPart: [
        {
          title: {
            fr: "Conception d'un outil de suivi de production",
            en: "Designing a production tracking tool",
          },
          description: {
            fr: "Afin de minimiser les erreurs de comptage de sachets de thé, j'ai conçu un outil de suivi de production grâce à un automate programmable industriel et le langage LADDER. Cet outil permettait de compter en temps réel le nombre de sachets produits, et de les grouper par tas sur les tapis de la chaîne de production, avant leur mise en boîte.",
            en: "To minimize tea bag counting errors, I designed a production tracking tool using an industrial programmable logic controller and the LADDER language. This tool counted the number of bags produced in real time and grouped them into batches on the production line conveyors before boxing.",
          },
        },
        {
          title: {
            fr: "Contribution au déploiement de nouveau terminaux de paiement",
            en: "Contributing to the rollout of new payment terminals",
          },
          description: {
            fr: "Lors de mon stage, l'entreprise mettait à jour l'ensemble de ses terminaux de paiement électroniques dans toutes les boutiques de France. J'ai ainsi pu contribuer à leur paramétrage, et à la vérification de leur bon fonctionnement.",
            en: "During my internship, the company was upgrading all its electronic payment terminals across every store in France. I contributed to configuring them and verifying they were working correctly.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Dévelopement Web", en: "Web Development" },
    href: "personnal/web",
    description: { fr: "Site web portfolio", en: "Portfolio website" },
    category: "perso",
    img: "/img/web",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["html", "css", "javascript", "react"],
    photos: [],
    pageContent: {
      context: {
        fr: "De nature curieuse, et étant donné qu'aucun cours de développement front-end n'était proposé dans ma formation, j'ai décidé de me lancer dans la création de mon propre portfolio. J'ai ainsi pu comprendre le fonctionnement du web, et m'initier au monde des interfaces graphiques dynamiques.",
        en: "Being naturally curious, and since no front-end development course was offered in my program, I decided to build my own portfolio. This let me understand how the web works and get started with dynamic graphical interfaces.",
      },
      mainPart: [
        {
          title: { fr: "Portfolio", en: "Portfolio" },
          description: {
            fr: "J'ai commencé par créer une première version de mon portfolio en utilisant les langages HTML, CSS et JavaScript. J'ai ensuite décidé de l'améliorer grâce à React.js, pour me familiariser avec ce framework, et en apprendre davantage sur les frameworks full-stack (Next.js). J'ai également utilisé TailwindCSS pour faciliter le design.",
            en: "I started by creating a first version of my portfolio using HTML, CSS, and JavaScript. I then decided to improve it with React.js, to get familiar with the framework and learn more about full-stack frameworks (Next.js). I also used TailwindCSS to make styling easier.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Programmation", en: "Programming" },
    href: "emse/programming",
    description: {
      fr: "Algorithmie et structure de données",
      en: "Algorithms and data structures",
    },
    category: "ecole",
    img: "/img/programming",
    entityLogo: "/logos/emse",
    githubRepo: "https://github.com/dylan-bernhardt/dactylo-race",
    techLogos: ["python", "cpp", "git"],
    photos: [],
    pageContent: {
      context: {
        fr: "Une variété de programmes informatiques réalisés au cours de ma formation en école d'ingénieur.",
        en: "A variety of computer programs written during my engineering degree.",
      },
      mainPart: [
        {
          title: { fr: "Projet optimisation", en: "Optimization project" },
          description: {
            fr: 'Défi de programmation en binôme, consistant à optimiser un nombre de "surveillants", en fonction de la répartition des "cibles" dans une grille. Nous avons adopté diverses stratégies afin d\'obtenir la solution la plus optimale.',
            en: 'A pair-programming challenge consisting of optimizing a number of "watchers" based on the distribution of "targets" on a grid. We tried various strategies to find the most optimal solution.',
          },
        },
        {
          title: { fr: "Dactylo Race", en: "Dactylo Race" },
          description: {
            fr: "Application multijoueurs, dans laquelle nous avons orchestré des processus et des fils de discussion pour créer un jeu. Les participants participent à un défi compétitif qui leur demandait de taper rapidement et avec précision une phrase présentée. Nous avons supervisé des tâches telles que l'enregistrement des joueurs, l'affichage des phrases et le chronométrage. Lorsque tous les joueurs ont terminé, le jeu présente un podium, offrant la possibilité de rejouer ou de quitter le jeu.",
            en: "A multiplayer application in which we orchestrated processes and threads to build a game. Participants took part in a competitive challenge that required them to type a given sentence quickly and accurately. We handled tasks such as registering players, displaying sentences, and timing. Once all players finished, the game displayed a podium, with the option to replay or quit.",
          },
        },
        {
          title: {
            fr: "Dictionnaire de prédiction",
            en: "Predictive dictionary",
          },
          description: {
            fr: "Ce projet C portait sur le développement d'un dictionnaire de prédiction, qui proposait des suggestions de mots basées sur les entrées de l'utilisateur. Lorsque les utilisateurs saisissent des chaînes de caractères, l'application propose des choix de mots probables en se référant à un dictionnaire conversationnel existant. Dans les cas où aucune correspondance n'était trouvée, nous avons mis en œuvre un système logique pour proposer des mots français courants susceptibles de compléter la saisie de l'utilisateur.",
            en: "This C project focused on building a predictive dictionary that suggested words based on user input. As users typed character strings, the application suggested likely word choices by referring to an existing conversational dictionary. Where no match was found, we implemented a logic-based system to suggest common French words that could complete the user's input.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Systèmes Embarqués", en: "Embedded Systems" },
    href: "emse/embedded",
    description: { fr: "Projet Robot", en: "Robot project" },
    category: "ecole",
    img: "/img/embedded",
    entityLogo: "/logos/emse",
    githubRepo: null,
    techLogos: [],
    photos: ["/img/embedded-1", "/img/embedded-2"],
    pageContent: {
      context: {
        fr: "Dans le cadre de ma formation en école d'ingénieur, j'ai eu l'opportunité de travailler sur un projet de systèmes embarqués. Ce projet s'est déroulé sur les deux premières années, par binôme.",
        en: "As part of my engineering degree, I had the opportunity to work on an embedded systems project. This project ran over the first two years, in pairs.",
      },
      mainPart: [
        {
          title: {
            fr: "Conception de la carte électronique",
            en: "Designing the electronic board",
          },
          description: {
            fr: "Dans un premier temps, nous avons été amenés à étudier les différents composants électroniques nécessaires à la réalisation de notre projet. Nous avons ensuite conçu une carte électronique, qui permettait de contrôler les différents moteurs du robot, et de communiquer avec un ordinateur via une liaison série. Différents capteurs étaient également présents sur la carte, pour permettre au robot de se déplacer de manière autonome. Nous avons enfin pu simuler le comportement du robot sur le logiciel de simulation Proteus.",
            en: "First, we studied the various electronic components needed for our project. We then designed an electronic board to control the robot's motors and communicate with a computer over a serial link. Various sensors were also present on the board, to let the robot move autonomously. Finally, we were able to simulate the robot's behavior using the Proteus simulation software.",
          },
        },
        {
          title: {
            fr: "Développement du programme de contrôle",
            en: "Developing the control program",
          },
          description: {
            fr: "Par la suite, nous avons été amenés à programmer la carte électronique, à travers l'utilisation du langage C embarqué. Ce programme permettait au robot de quadriller une zone ciruclaire devant lui, et d'identifier un obstacle proche. Nous avons plus tard amélioré ce projet, par l'utilisation cette fois du microcontrôleur STM32, et du logiciel STM32CubeIDE. Le robot était alors capable de se déplacer de manière autonome, afin de se garer dans une zone de stationnement.",
            en: "We then programmed the electronic board using embedded C. This program let the robot scan a circular zone in front of it and detect a nearby obstacle. We later improved this project by switching to the STM32 microcontroller and the STM32CubeIDE software. The robot was then able to move autonomously to park itself in a designated area.",
          },
        },
      ],
    },
  },
  {
    title: { fr: "Robotique", en: "Robotics" },
    href: "cpge_tipe",
    description: {
      fr: "Élaboration d'un bras d'exosquelette",
      en: "Designing an exoskeleton arm",
    },
    category: "ecole",
    img: "/img/tipe",
    entityLogo: "/logos/ac-normandie",
    githubRepo: null,
    techLogos: ["arduino"],
    photos: ["/img/tipe-1", "/img/tipe-2"],
    pageContent: {
      context: {
        fr: "Durant les classes préparatoires, j'ai réalisé un mon TIPE (Travail d'Initiative Personnelle Encadré) sur le thème de la robotique. Ce projet a été mené en collaboration avec un camarade de classe et a été présenté lors des concours d'entrée aux écoles d'ingénieurs. Nous nous étions fixés l'objectif de concevoir un bras d'exosquelette, capable d'acompagner les mouvements de l'utilisateur lors de la réalisation de tâches répétitives.",
        en: "During my preparatory classes (CPGE), I completed my TIPE (a supervised, self-directed research project) on the theme of robotics. This project was carried out with a classmate and presented at the entrance exams for engineering schools. We set ourselves the goal of designing an exoskeleton arm capable of assisting the user's movements while performing repetitive tasks.",
      },
      mainPart: [
        {
          title: {
            fr: "Création de pièces mécaniques",
            en: "Designing mechanical parts",
          },
          description: {
            fr: "Nous avons commencé par modéliser différentes pièces mécaniques sur Solidworks. Ces pièces devaient pouvoir s'incorporer sur une attèle de rééducation, qui nous servait de base pour le projet. Ainsi, nous avons conçu une pièce permettant de fixer un moteur sur l'attèle, le plus proche de la liaison pivot située sur le coude.",
            en: "We started by modeling various mechanical parts in SolidWorks. These parts had to fit onto a rehabilitation splint, which served as the base for the project. We designed a part that mounts a motor on the splint, as close as possible to the pivot joint located at the elbow.",
          },
        },
        {
          title: {
            fr: "Mise en place du système de commande et de contrôle",
            en: "Setting up the command and control system",
          },
          description: {
            fr: "Par la suite, nous avons mis en place un système de commande et de contrôle pour le bras d'exosquelette. Nous avons utilisé une carte Arduino pour contrôler le moteur, et nous avons développé un programme pour gérer les différentes tâches du bras.",
            en: "We then set up a command and control system for the exoskeleton arm. We used an Arduino board to control the motor, and developed a program to manage the arm's various tasks.",
          },
        },
      ],
    },
  },
] satisfies readonly Project[];
