import "../app/app.css";
import Link from "next/link";

export const projects = [
  {
    title: "Safran",
    href: "internships/safran",
    description: "Stage de fin d'études",
    entityLogo: "/logos/LOGO_SAFRAN_rvb.png",
    githubRepo: null,
    techLogos: ["typescript","react", "git", "linux"],
    cssClassCard: "safran",
    pageContent: {
      context: "",
      mainPart: [],
    },
  },
  {
    title: "SNCF",
    href: "research/sncf",
    description: "Projet de recherche",
    entityLogo: "/logos/LOGO_SNCF.png",
    githubRepo: null,
    techLogos: ["java", "git"],
    cssClassCard: "sncf",
    pageContent: {
      context: "",
      mainPart: [],
    },
  },
  {
    title: "CCTV",
    href: "personnal/cctv",
    description: "Projet de vidéo surveillance",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["arduino", "python", "react"],
    cssClassCard: "cctv",
    pageContent: {
      context: "",
      mainPart: [],
    },
  },
  {
    title: "Android",
    href: "emse/android",
    description: "Développement d'une application mobile",
    cssClassCard: "android",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: null,
    techLogos: ["kotlin", "typescript", "git"],
    pageContent: {
      context: "",
      mainPart: [],
    },
  },
  {
    title: "Démineur",
    href: "emse/minesweeper",
    description: "Développement d'un jeu de démineur",
    cssClassCard: "minesweeper",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: null,
    techLogos: ["java"],
    pageContent: {
      context: "",
      mainPart: [],
    },
  },
  {
    title: "Quimesis",
    href: "internships/quimesis",
    description: "Stage d'ingénierie logicielle",
    cssClassCard: "quimesis",
    entityLogo: "/logos/LOGO_QUIMESIS.png",
    githubRepo: null,
    techLogos: ["cpp", "react", "git", "linux"],
    pageContent: {
      context:
        "Dans le cadre de ma seconde année d'école d'ingénieur, j'ai eu l'opportunité de réaliser un stage d'ingénierie logicielle chez Quimesis, une entreprise Belge spécialisée dans trois domaines : la mécanique, l'électronique et l'informatique. J'ai été amené à travailler sur un projet informatique dans le domaine médical. Pour des raisons de confidentialité, certains détails ne peuvent être dévoilés.",
      mainPart: [
        {
          title: "Amélioration d'algorithmes de segmentation dentaire",
          description:
            "La première étape de ce stage a consisté à améliorer les algorithmes de segmentation dentaire (séparation d'une dent de ses voisines et de la gencive). Pour cela, j'ai utilisé la librairie VTK en C++, qui permet de manipuler des images 3D. Ainsi, j'ai incorporé une fonctionnalité permettant de déplacer les points de la frontière calculée dans un premier temps, afin de retracer cette même frontière à la main, de manière précise. ",
        },
        {
          title: "Développement d'une application web",
          description:
            "Dans un but de faciliter l'intégration du logiciel de segmentation dentaire dans le quotidien des dentistes, j'ai développé une application web en React.js, intégrant la librarie VTK. Cette application permet de visualiser les images 3D des dents, de les segmenter, et de les exporter, le tout depuis un navigateur web. Elle est également dotée de fonctionnalités de visualisation supplémentaires. Cette étape m'a permis de comprendre les principes de fonctionnement d'applicationss full-stack.",
        },
        {
          title: "Mise en place d'un environnement de développement optimisé",
          description:
            "Afin que mon travail puisse être repris par les développeurs de l'entreprise, j'ai mis en place un environnement de développement optimisé. Pour cela, j'ai utilisé WebAssembly, qui permet de compiler du code C++ en code JavaScript. Dans un premier temps, cette technologie permettait d'optimiser la fluidité du rendu de l'application. Par la suite, j'ai mis en place un environnement de \"Hot-Reload\" qui permet de recharger automatiquement l'application lorsqu'un changement est effectué dans le code source, sans recompilation du C++. ",
        },
      ],
    },
  },
  {
    title: "Kusmi Tea",
    href: "internships/kusmitea",
    description: "Stage ouvrier",
    cssClassCard: "kusmitea",
    entityLogo: "/logos/LOGO_KUSMI_TEA.png",
    githubRepo: null,
    techLogos: [],
    pageContent: {
      context:
        "Durant ma première année d'école d'ingénieur, j'ai réalisé un stage ouvrier chez Kusmi Tea, entreprise spécialisée dans l'import / l'export et la vente de thé. J'ai été amené à travailler sur la chaîne de production, et au support informatique.",
      mainPart: [
        {
          title: "Conception d'un outil de suivi de production",
          description:
            "Afin de minimiser les erreurs de comptage de sachets de thé, j'ai conçu un outil de suivi de production. Cet outil permettait de compter en temps réel le nombre de sachets produits, et de les grouper par tas avant leur mise en boîte. Le travail des opérateurs sur les chaînes de production était ainsi facilité. J'ai donc pu utiliser un automate programmable industriel et le langage LADDER.",
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
    cssClassCard: "web",
    entityLogo: null,
    githubRepo: null,
    techLogos: ["html", "css", "javascript", "react"],
    pageContent: {
      context:
        "De nature curieuse, et étant donné qu'aucun cours de développement front-end n'était proposé dans ma formation, j'ai décidé de me lancer dans la création de mon propre portfolio. J'ai ainsi pu comprendre le fonctionnement du web, et m'initier au monde des interfaces graphiques dynamiques. Durant cette dernière année d'école d'ingénieur, un cours de développement web est proposé, aucours duquel nous avons été amenés à développer une API Rest.",
      mainPart: [
        {
          title: "Portfolio",
          description:
            "J'ai commencé par créer une première version de mon portfolio en utilisant les langages HTML, CSS et JavaScript. J'ai ensuite décidé de l'améliorer grâce à React.js, pour me familiariser avec ce framework, et en apprendre davantage sur les frameworks full-stack (Next.js). J'ai également utilisé TailwindCSS pour faciliter le design.",
        },
        {
          title: "Développement d'une API Rest",
          description:
            "Je poursuis actuellement un projet de développement d'une API Rest en TypeScript, à travers le framework Nest.js. Plus d'informations à venir !",
        },
      ],
    },
  },
  {
    title: "Programmation",
    href: "emse/programming",
    description: "Algorithmie et structure de données",
    cssClassCard: "programming",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: null,
    techLogos: ["python", "cpp", "git"],
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
            "Application multijoueurs, dans laquelle nous avons orchestré des processus et des fils de discussion pour créer un jeu. Les participants participent à un défi compétitif qui leur demandait de taper rapidement et avec précision une phrase présentée. Nous avons supervisé des tâches telles que l'enregistrement des joueurs, l'affichage des phrases et le chronométrage.Lorsque tous les joueurs ont terminé, le jeu présente un podium, offrant la possibilité de rejouer ou de quitter le jeu.",
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
    cssClassCard: "embedded",
    entityLogo: "/logos/LOGO_EMSE.png",
    githubRepo: null,
    techLogos: [],
    pageContent: {
      context:
        "Dans le cadre de ma formation en école d'ingénieur, j'ai eu l'opportunité de travailler sur un projet de systèmes embarqués. Ce projet s'est déroulé sur les deux premières années, en binôme avec un camarade de classe.",
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
    cssClassCard: "tipe",
    entityLogo: "/logos/LOGO_AC_NORMANDIE.svg",
    githubRepo: null,
    techLogos: ["arduino"],
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
            "Par la suite, nous avons mis en place un système de commande et de contrôle pour le bras d'exosquelette. Nous avons utilisé une carte Arduino pour contrôler le moteur, et nous avons développé un programme en C++ pour gérer les différentes tâches du bras.",
        },
      ],
    },
  },
];

const ProjectCard = ({ project }) => (
  <div className="p-4">
    <Link
      href={`/${project.href}`}
      className="relative h-full w-full fulldiv cursor-pointer"
    >
      <div
        className={`absolute h-full w-full rounded-lg ${project.cssClassCard}`}
      ></div>
      <div className="flex flex-col justify-around items-center border border-second h-full rounded-lg w-full">
        <h1 className="title">{project.title}</h1>
        <h3 className="description">{project.description}</h3>
      </div>
    </Link>
  </div>
);

function ProjectsSection() {
  return (
    <section
      id="section-portfolio"
      className="flex justify-center items-center h-full"
    >
      <div className="container h-5/6 p-5">
        <h1 className="outlined-text">Portfolio</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 h-full">
          {projects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProjectsSection;
