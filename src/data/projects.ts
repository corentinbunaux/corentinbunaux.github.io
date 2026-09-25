/**
 * Single source of truth for the portfolio's projects.
 *
 * Extracted from `src/components/projectsSection.jsx` (PORT-008). Both the
 * portfolio grid (`projectsSection.jsx`) and the project page
 * (`project.tsx`) read from here.
 */

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
  readonly title: string;
  readonly description: string;
}

/** The long-form content of a project page. */
export interface ProjectPageContent {
  readonly context: string;
  readonly mainPart: readonly ProjectSection[];
}

export interface Project {
  /** Entity or project name, shown on the card and as the page heading. */
  readonly title: string;
  /** Route without a leading slash, e.g. `internships/safran`. */
  readonly href: string;
  /** One-line subtitle shown under the title. */
  readonly description: string;
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
  /** Omitted where the location is not confirmed. */
  readonly location?: string;
  readonly pageContent: ProjectPageContent;
}

export const projects = [
  {
    title: "Safran",
    href: "internships/safran",
    description: "Stage de fin d'études",
    entityLogo: "/logos/LOGO_SAFRAN_rvb.png",
    githubRepo: null,
    techLogos: ["typescript", "react", "git", "linux"],
    img: "/img/safran.jpg",
    photos: [],
    period: { status: "completed", start: "2025-04", end: "2025-09" },
    pageContent: {
      context:
        "Lors de ma dernière année aux Mines de Saint-Etienne, j'ai eu l'opportunité de réaliser un stage de fin d'études au sein de l'entreprise Safran Data Systems. Ce stage m'a permis de m'immerger dans le monde spatial et de travailler sur des outils internes pour différentes équipes, ainsi qu'une application cliente.",
      mainPart: [
        {
          title: "Réalisation d'un benchmark",
          description:
            "Afin de choisir les technologies les plus adaptées aux projets backend Safran, j'ai été amené à réaliser un état de l'art des solutions d'API RESTful, et un comparatif des performances de différents frameworks pour ces projets. Puis, après présentation des résultats aux différentes équipes, j'ai pu développer un framework complet pour les besoins de l'entreprise à partir de la solution optimale retenue.",
        },
        {
          title: "Mise en place d'un CLI",
          description:
            "Après finalisation du framework, j'ai travaillé sur la mise en place d'une interface en ligne de commande (CLI) pour faciliter l'utilisation du framework nouvellement créé. Ce CLI permet aux utilisateurs de générer des projets rapidement, et d'intégrer facilement différentes fonctionnalités à un projet. Le déploiement du CLI sur le registry Safran a permis à différentes équipes de l'utiliser intuitivement.",
        },
        {
          title: "Utilisation du framework pour différents projets",
          description:
            "Finalement, j'ai pu tester le framework sur plusieurs projets internes, ce qui a permis de valider son efficacité et sa flexibilité. J'ai ainsi pu améliorer certaines fonctionnalités, et en ajouter de nouvelles grâce à des cas concrets d'utilisation.",
        },
      ],
    },
  },
  {
    title: "SNCF",
    href: "research/sncf",
    description: "Projet de recherche",
    entityLogo: "/logos/LOGO_SNCF.png",
    githubRepo: "https://github.com/corentinbunaux/projet-recherche-SNCF",
    techLogos: ["java", "git"],
    img: "/img/sncf.jpg",
    photos: [],
    pageContent: {
      context:
        "Ce projet faisait office de projet de fin d'études à l'école des Mines. Il avait pour objectif de répondre à un besoin spécifique de la SNCF en matière de recherche et d'innovation. Par groupe de 4 étudiants, nous avons travaillé durant 1 mois sur l'optimisation d'un problème de génération de trajets propre à la SNCF.",
      mainPart: [
        {
          title: "Problématique",
          description:
            "Afin de représenter les différents trajets possibles sur les lignes de chemins de fer, la SNCF se munie de Graphiques Espace Temps, qui permettent de représenter l'utilisation des différentes lignes par différents trains, en fonction du temps. Un des problèmes les plus ennuyeux de ce système est la lisibilité de ces graphiques. En effet, plus un grand nombre de gares sont représentées, moins il est aisé de lire le graphique. Ainsi le projet qui nous a été confié était un projet d'optimisation de ces graphiques.",
        },
        {
          title: "Solution envisagée",
          description:
            "Nous avons proposé de solutionner ce problème en repensant la manière dont les trajets étaient générés sur ces graphiques. Nous avons utilisé la topologie du réseau de chemins de fer pour optimiser la représentation des trajets. Cette première solution a permis de réduire le nombre de gares représentées sur chaque graphique, améliorant ainsi leur lisibilité. Néanmoins, il restait encore des améliorations à apporter, puisque cette représentation était trop éloignée de la réalité terrain.",
        },
        {
          title: "Solution améliorée",
          description:
            "Nous avons affiné notre approche en intégrant les flux de trafic réels dans notre modèle. Ainsi, la génération des trajets tenait compte des flux réels des trains sur une voie donnée. Cette nouvelle approche a permis d'améliorer significativement la pertinence des trajets générés, en les rendant plus réalistes et exploitables, mais en détériorant la lisibilité des graphiques. Finalement, notre solution a tout de même amélioré la situation en proposant des graphiques plus clairs et plus informatifs, en réduisant par 3 (en moyenne) le nombre de gares représentées.",
        },
      ],
    },
  },
  {
    title: "CCTV",
    href: "personnal/cctv",
    description: "Projet de vidéo surveillance",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["arduino", "python", "react"],
    img: "/img/cctv.jpg",
    photos: [],
    pageContent: {
      context:
        "En guise de projet personnel en parallèle des cours de dernière année aux Mines, je me suis lancé dans le développement d'un système de vidéo surveillance, accessible en ligne.",
      mainPart: [
        {
          title: "Développement du montage",
          description:
            "J'ai conçu et assemblé les différents composants matériels nécessaires au fonctionnement du système, grâce notamment à des cartes Arduino et ESP32. L'idée principale du montage était d'avoir une carte Arduino centrale, qui gérait l'ensemble des informations qui lui étaient transmises. Différents capteurs étaient connectés afin de récolter des données sur l'environnement (lumière, mouvement, son). Puis, cette carte principale communiquait avec les autres ESP32 via bluetooth, pour récupérer les flux vidéo ou photos qui étaient capturés. J'ai notamment utilisé un capteur PIR pour détécter quand prendre une photo (cas d'une intrusion dans le domicile).",
        },
        {
          title: "Développement d'une API",
          description:
            "Par la suite, j'ai développé une API RESTful en Django pour permettre à l'application de communiquer avec le système de vidéo surveillance. Cette API gérait les requêtes des utilisateurs, telles que l'authentification, la récupération des flux vidéo et la gestion des paramètres de sécurité. Toutes les requêtes étaient effectuées par la carte Arduino, de façon autonome, afin de stocker les photos prises ou les données récupérées.",
        },
        {
          title: "Développement d'une interface utilisateur",
          description:
            "Enfin, j'ai développé une interface utilisateur en React pour permettre aux utilisateurs d'interagir avec le système de vidéo surveillance. Cette interface affichait les photos prises sous forme de visionneuse en ligne, et offrait une vue d'ensemble des données collectées par les capteurs.",
        },
      ],
    },
  },
  {
    title: "Android",
    href: "emse/android",
    description: "Développement d'une application mobile",
    img: "/img/android.jpg",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: null,
    techLogos: ["kotlin", "typescript", "git"],
    photos: [],
    pageContent: {
      context:
        "Lors de ma dernière année à l'école des Mines, un cours de développement web nous a permis de travailler sur un projet de création d'une application mobile. En binômes, nous avons choisi de développer une application de visualisation des radars automobiles.",
      mainPart: [
        {
          title: "Création d'une API",
          description:
            "Pour permettre à notre application d'accéder aux données des radars, nous avons dû créer une API RESTful. Cette API était responsable de la gestion des données des radars, y compris leur ajout, leur suppression et leur mise à jour. Nous avons utilisé le framework NestJS pour ce faire, et avons recueilli des données publiques pour peupler l'API.",
        },
        {
          title: "Interface Android",
          description:
            "En parallèle, une interface Android a été développée en utilisant Kotlin, sous l'IDE Android Studio. Cette interface permettait aux utilisateur d'interagir avec l'application par le biais de différents menus, notamment une liste déroulante des radars, depuis laquelle des détails étaient accessibles, ainsi qu'une carte affichant leur répartition géographique.",
        },
      ],
    },
  },
  {
    title: "Démineur",
    href: "emse/minesweeper",
    description: "Développement d'un jeu de démineur",
    img: "/img/minesweeper.png",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: "https://github.com/corentinbunaux/minesweeper",
    techLogos: ["java"],
    photos: [],
    pageContent: {
      context:
        "Dans le cadre de ma formation en école d'ingénieur, j'ai eu l'opportunité de travailler sur un projet de développement d'un jeu du démineur, qui accompagnait un cours sur le développement Java.",
      mainPart: [
        {
          title: "Partie classique",
          description:
            "Dans un premier temps, j'ai développé la logique du jeu traditionnel, ainsi qu'une interface graphique simple avec la librairie Swing. Le but de ce cours était avant tout de se concentrer sur les aspects backend de l'app. Plusieurs grilles de différents niveaux étaient générées de manière aléatoire, avec un nombre fixé de bombes pour chacun. La propagation lors du clic sur une case vide était active.",
        },
        {
          title: "Jeu multijoueur",
          description:
            "Dans un second temps, j'ai ajouté une fonctionnalité de jeu multijoueur, permettant à plusieurs utilisateurs de se connecter et de jouer ensemble. J'ai utilisé des sockets pour gérer la communication entre les clients et le serveur, et j'ai dû repenser certaines parties de la logique du jeu pour gérer les interactions entre les joueurs. La propagation du clic sur une case vide était cette fois-ci désactivée, car les règles du jeu multijoueur différaient de celles du jeu classique. Dans ce mode, 1 clic correspondait à 1 point, et le but était d'obtenir le maximum de points sur une grille, sans cliquer sur une bombe (le joueur était éliminé auquel cas).",
        },
      ],
    },
  },
  {
    title: "Quimesis",
    href: "internships/quimesis",
    description: "Stage d'ingénierie logicielle",
    img: "/img/quimesis.jpg",
    entityLogo: "/logos/LOGO_QUIMESIS.png",
    githubRepo: null,
    techLogos: ["cpp", "react", "git", "linux"],
    photos: ["/img/Quimesis1.png", "/img/Quimesis2.png", "/img/Quimesis3.png"],
    period: { status: "completed", start: "2024-04", end: "2024-07" },
    pageContent: {
      context:
        "Dans le cadre de ma seconde année d'école d'ingénieur, j'ai eu l'opportunité de réaliser un stage d'ingénierie logicielle chez Quimesis, une entreprise Belge spécialisée dans trois domaines : la mécanique, l'électronique et l'informatique. J'ai été amené à travailler sur un projet informatique dans le domaine médical.",
      mainPart: [
        {
          title: "Amélioration d'algorithmes de segmentation dentaire",
          description:
            "La première étape de ce stage a consisté à améliorer les algorithmes de segmentation dentaire, qui permettent de séparer une dent de ses voisines et de la gencive. Pour cela, j'ai utilisé la librairie VTK en C++, qui permet de manipuler des images 3D. J'ai ajouté une fonctionnalité permettant de déplacer les points de la frontière entre une dent et ses voisines / la gencive (calculée mathématiquement), afin de retracer cette même frontière à la main, de manière précise.",
        },
        {
          title: "Développement d'une application web",
          description:
            "Dans un but de faciliter l'intégration du logiciel de segmentation dentaire dans le quotidien des dentistes, j'ai développé une application web en React.js, intégrant la librarie VTK. Cette application permet de visualiser les images 3D des dents, de les segmenter, et de les exporter, le tout depuis un navigateur web. Elle est également dotée de fonctionnalités de visualisation supplémentaires. Cette étape m'a permis de comprendre les principes de fonctionnement d'applications full-stack.",
        },
        {
          title: "Mise en place d'un environnement de développement optimisé",
          description:
            "Afin que mon travail puisse être repris par les développeurs de l'entreprise, j'ai mis en place un environnement de développement optimisé. Pour cela, j'ai utilisé WebAssembly, qui permet de compiler du code C++ en code JavaScript. Dans un premier temps, cette technologie permettait d'optimiser la fluidité du rendu de l'application. Par la suite, j'ai mis en place un environnement de \"Hot-Reload\" qui permet de recharger automatiquement l'application lorsqu'un changement est effectué dans le code source, sans recompilation complète du C++. ",
        },
      ],
    },
  },
  {
    title: "Kusmi Tea",
    href: "internships/kusmitea",
    description: "Stage ouvrier",
    img: "/img/kusmitea.jpg",
    entityLogo: "/logos/LOGO_KUSMI_TEA.png",
    githubRepo: null,
    photos: ["/img/Kusmi1.jpg"],
    techLogos: [],
    period: { status: "completed", start: "2023-01", end: "2023-01" },
    pageContent: {
      context:
        "Durant ma première année d'école d'ingénieur, j'ai réalisé un stage ouvrier chez Kusmi Tea, entreprise spécialisée dans l'import/export et la vente de thé. J'ai été amené à travailler sur la chaîne de production, et au support informatique.",
      mainPart: [
        {
          title: "Conception d'un outil de suivi de production",
          description:
            "Afin de minimiser les erreurs de comptage de sachets de thé, j'ai conçu un outil de suivi de production grâce à un automate programmable industriel et le langage LADDER. Cet outil permettait de compter en temps réel le nombre de sachets produits, et de les grouper par tas sur les tapis de la chaîne de production, avant leur mise en boîte.",
        },
        {
          title: "Contribution au déploiement de nouveau terminaux de paiement",
          description:
            "Lors de mon stage, l'entreprise mettait à jour l'ensemble de ses terminaux de paiement électroniques dans toutes les boutiques de France. J'ai ainsi pu contribuer à leur paramétrage, et à la vérification de leur bon fonctionnement.",
        },
      ],
    },
  },
  {
    title: "Dévelopement Web",
    href: "personnal/web",
    description: "Site web portfolio",
    img: "/img/web.jpg",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["html", "css", "javascript", "react"],
    photos: [],
    pageContent: {
      context:
        "De nature curieuse, et étant donné qu'aucun cours de développement front-end n'était proposé dans ma formation, j'ai décidé de me lancer dans la création de mon propre portfolio. J'ai ainsi pu comprendre le fonctionnement du web, et m'initier au monde des interfaces graphiques dynamiques.",
      mainPart: [
        {
          title: "Portfolio",
          description:
            "J'ai commencé par créer une première version de mon portfolio en utilisant les langages HTML, CSS et JavaScript. J'ai ensuite décidé de l'améliorer grâce à React.js, pour me familiariser avec ce framework, et en apprendre davantage sur les frameworks full-stack (Next.js). J'ai également utilisé TailwindCSS pour faciliter le design.",
        },
      ],
    },
  },
  {
    title: "Programmation",
    href: "emse/programming",
    description: "Algorithmie et structure de données",
    img: "/img/programming.jpg",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: "https://github.com/dylan-bernhardt/dactylo-race",
    techLogos: ["python", "cpp", "git"],
    photos: [],
    pageContent: {
      context:
        "Une variété de programmes informatiques réalisés au cours de ma formation en école d'ingénieur.",
      mainPart: [
        {
          title: "Projet optimisation",
          description:
            'Défi de programmation en binôme, consistant à optimiser un nombre de "surveillants", en fonction de la répartition des "cibles" dans une grille. Nous avons adopté diverses stratégies afin d\'obtenir la solution la plus optimale.',
        },
        {
          title: "Dactylo Race",
          description:
            "Application multijoueurs, dans laquelle nous avons orchestré des processus et des fils de discussion pour créer un jeu. Les participants participent à un défi compétitif qui leur demandait de taper rapidement et avec précision une phrase présentée. Nous avons supervisé des tâches telles que l'enregistrement des joueurs, l'affichage des phrases et le chronométrage. Lorsque tous les joueurs ont terminé, le jeu présente un podium, offrant la possibilité de rejouer ou de quitter le jeu.",
        },
        {
          title: "Dictionnaire de prédiction",
          description:
            "Ce projet C portait sur le développement d'un dictionnaire de prédiction, qui proposait des suggestions de mots basées sur les entrées de l'utilisateur. Lorsque les utilisateurs saisissent des chaînes de caractères, l'application propose des choix de mots probables en se référant à un dictionnaire conversationnel existant. Dans les cas où aucune correspondance n'était trouvée, nous avons mis en œuvre un système logique pour proposer des mots français courants susceptibles de compléter la saisie de l'utilisateur.",
        },
      ],
    },
  },
  {
    title: "Systèmes Embarqués",
    href: "emse/embedded",
    description: "Projet Robot",
    img: "/img/embedded.jpg",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: null,
    techLogos: [],
    photos: ["/img/Embedded1.jpg", "/img/Embedded2.png"],
    pageContent: {
      context:
        "Dans le cadre de ma formation en école d'ingénieur, j'ai eu l'opportunité de travailler sur un projet de systèmes embarqués. Ce projet s'est déroulé sur les deux premières années, par binôme.",
      mainPart: [
        {
          title: "Conception de la carte électronique",
          description:
            "Dans un premier temps, nous avons été amenés à étudier les différents composants électroniques nécessaires à la réalisation de notre projet. Nous avons ensuite conçu une carte électronique, qui permettait de contrôler les différents moteurs du robot, et de communiquer avec un ordinateur via une liaison série. Différents capteurs étaient également présents sur la carte, pour permettre au robot de se déplacer de manière autonome. Nous avons enfin pu simuler le comportement du robot sur le logiciel de simulation Proteus.",
        },
        {
          title: "Développement du programme de contrôle",
          description:
            "Par la suite, nous avons été amenés à programmer la carte électronique, à travers l'utilisation du langage C embarqué. Ce programme permettait au robot de quadriller une zone ciruclaire devant lui, et d'identifier un obstacle proche. Nous avons plus tard amélioré ce projet, par l'utilisation cette fois du microcontrôleur STM32, et du logiciel STM32CubeIDE. Le robot était alors capable de se déplacer de manière autonome, afin de se garer dans une zone de stationnement.",
        },
      ],
    },
  },
  {
    title: "Robotique",
    href: "cpge_tipe",
    description: "Élaboration d'un bras d'exosquelette",
    img: "/img/tipe.jpg",
    entityLogo: "/logos/LOGO_AC_NORMANDIE.svg",
    githubRepo: null,
    techLogos: ["arduino"],
    photos: ["/img/tipe1.png", "/img/tipe2.png"],
    pageContent: {
      context:
        "Durant les classes préparatoires, j'ai réalisé un mon TIPE (Travail d'Initiative Personnelle Encadré) sur le thème de la robotique. Ce projet a été mené en collaboration avec un camarade de classe et a été présenté lors des concours d'entrée aux écoles d'ingénieurs. Nous nous étions fixés l'objectif de concevoir un bras d'exosquelette, capable d'acompagner les mouvements de l'utilisateur lors de la réalisation de tâches répétitives.",
      mainPart: [
        {
          title: "Création de pièces mécaniques",
          description:
            "Nous avons commencé par modéliser différentes pièces mécaniques sur Solidworks. Ces pièces devaient pouvoir s'incorporer sur une attèle de rééducation, qui nous servait de base pour le projet. Ainsi, nous avons conçu une pièce permettant de fixer un moteur sur l'attèle, le plus proche de la liaison pivot située sur le coude.",
        },
        {
          title: "Mise en place du système de commande et de contrôle",
          description:
            "Par la suite, nous avons mis en place un système de commande et de contrôle pour le bras d'exosquelette. Nous avons utilisé une carte Arduino pour contrôler le moteur, et nous avons développé un programme pour gérer les différentes tâches du bras.",
        },
      ],
    },
  },
] satisfies readonly Project[];
