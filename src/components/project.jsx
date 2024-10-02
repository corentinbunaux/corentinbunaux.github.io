"use client";

import Link from 'next/link'
import Image from 'next/image'
import '../app/app.css'
import { useEffect, useState } from 'react'
import Robotics1 from '../img/Robotics1.png'
import Robotics2 from '../img/Robotics2.png'

import Quimesis1 from '../img/Quimesis1.png'
import Quimesis2 from '../img/Quimesis2.png'
import Quimesis3 from '../img/Quimesis3.png'
import Kusmi1 from '../img/Kusmi1.jpg'
import Kusmi2 from '../img/Kusmi2.jpg'
import Embedded1 from '../img/Embedded1.jpg'
import Embedded2 from '../img/Embedded2.png'
import Web1 from '../img/Web1.png'
import Web2 from '../img/Web2.jpg'
import Programing1 from '../img/Programing1.jpg'
import Programing2 from '../img/Programing2.jpg'
import Programing3 from '../img/Programing3.jpg'
import Programing4 from '../img/Programing4.png'

const contentOfPopUp = {
    android: {
        title: 'Android',
        description: 'Bientôt disponible !',
        context: 'Je poursuis actuellement un projet de développement d\'une application mobile sous Android en école d\'ingénieur. Plus d\'informations à venir !',
        mainPart: []
    },
    quimesis: {
        title: 'Quimesis',
        description: 'Stage d\'ingénierie logicielle',
        context: 'Dans le cadre de ma seconde année d\'école d\'ingénieur, j\'ai eu l\'opportunité de réaliser un stage d\'ingénierie logicielle chez Quimesis, une entreprise Belge spécialisée dans trois domaines : la mécanique, l\'électronique et l\'informatique. J\'ai été amené à travailler sur un projet informatique dans le domaine médical. Pour des raisons de confidentialité, certains détails ne peuvent être dévoilés.',
        mainPart: [
            {
                title: 'Amélioration d\'algorithmes de segmentation dentaire',
                technologies: 'VTK C++',
                description: 'La première étape de ce stage a consisté à améliorer les algorithmes de segmentation dentaire (séparation d\'une dent de ses voisines et de la gencive). Pour cela, j\'ai utilisé la librairie VTK en C++, qui permet de manipuler des images 3D. Ainsi, j\'ai incorporé une fonctionnalité permettant de déplacer les points de la frontière calculée dans un premier temps, afin de retracer cette même frontière à la main, de manière précise. ',
                illustration: Quimesis1,
            },
            {
                title: 'Développement d\'une application web',
                technologies: 'React.js',
                description: 'Dans un but de faciliter l\'intégration du logiciel de segmentation dentaire dans le quotidien des dentistes, j\'ai développé une application web en React.js, intégrant la librarie VTK. Cette application permet de visualiser les images 3D des dents, de les segmenter, et de les exporter, le tout depuis un navigateur web. Elle est également dotée de fonctionnalités de visualisation supplémentaires. Cette étape m\'a permis de comprendre les principes de fonctionnement d\'applicationss full-stack.',
                illustration: Quimesis2,
            },
            {
                title: 'Mise en place d\'un environnement de développement optimisé',
                technologies: 'WebAssembly',
                description: 'Afin que mon travail puisse être repris par les développeurs de l\'entreprise, j\'ai mis en place un environnement de développement optimisé. Pour cela, j\'ai utilisé WebAssembly, qui permet de compiler du code C++ en code JavaScript. Dans un premier temps, cette technologie permettait d\'optimiser la fluidité du rendu de l\'application. Par la suite, j\'ai mis en place un environnement de "Hot-Reload" qui permet de recharger automatiquement l\'application lorsqu\'un changement est effectué dans le code source, sans recompilation du C++. ',
                illustration: Quimesis3,
            },
        ],
    },
    kusmitea: {
        title: 'Kusmi Tea',
        description: 'Stage ouvrier',
        context: 'Durant ma première année d\'école d\'ingénieur, j\'ai réalisé un stage ouvrier chez Kusmi Tea, entreprise spécialisée dans l\'import / l\'export et la vente de thé. J\'ai été amené à travailler sur la chaîne de production, et au support informatique.',
        mainPart: [
            {
                title: 'Conception d\'un outil de suivi de production',
                technologies: 'LADDER',
                description: 'Afin de minimiser les erreurs de comptage de sachets de thé, j\'ai conçu un outil de suivi de production. Cet outil permettait de compter en temps réel le nombre de sachets produits, et de les grouper par tas avant leur mise en boîte. Le travail des opérateurs sur les chaînes de production était ainsi facilité. J\'ai donc pu utiliser un automate programmable industriel et le langage LADDER.',
                illustration: Kusmi1,
            },
            {
                title: 'Contribution au déploiement de nouveau terminaux de paiement',
                technologies: '',
                description: 'Lors de mon stage, l\'entreprise mettait à jour l\'ensemble de ses terminaux de paiement électroniques dans toutes les boutiques de France. J\'ai ainsi pu contribuer à leur paramétrage, et à la vérification de leur bon fonctionnement.',
                illustration: Kusmi2,
            },
        ],
    },
    datascience: {
        title: 'Science des données',
        description: 'Bientôt disponible !',
        context: 'Je poursuis actuellement des cours de data science en école d\'ingénieur, à travers ma spécialisation en Supply-Chain. Plus d\'informations à venir !',
        mainPart: []
    },
    web: {
        title: 'Développement Web',
        description: 'Portfolio & API Rest',
        context: 'De nature curieuse, et étant donné qu\'aucun cours de développement front-end n\'était proposé dans ma formation, j\'ai décidé de me lancer dans la création de mon propre portfolio. J\'ai ainsi pu comprendre le fonctionnement du web, et m\'initier au monde des interfaces graphiques dynamiques. Durant cette dernière année d\'école d\'ingénieur, un cours de développement web est proposé, aucours duquel nous avons été amenés à développer une API Rest.',
        mainPart: [
            {
                title: 'Portfolio',
                technologies: 'HTML, CSS, JavaScript, React.js, TailwindCSS, Next.js',
                description: 'J\'ai commencé par créer une première version de mon portfolio en utilisant les langages HTML, CSS et JavaScript. J\'ai ensuite décidé de l\'améliorer grâce à React.js, pour me familiariser avec ce framework, et en apprendre davantage sur les frameworks full-stack (Next.js). J\'ai également utilisé TailwindCSS pour faciliter le design.',
                illustration: Web1,
            },
            {
                title: 'Développement d\'une API Rest',
                technologies: 'TypeScript, Nest.js',
                description: 'Je poursuis actuellement un projet de développement d\'une API Rest en TypeScript, à travers le framework Nest.js. Plus d\'informations à venir !',
                illustration: Web2,
            },
        ],
    },
    programming: {
        title: 'Programmation',
        description: 'Algorithmie et structure de données',
        context: 'Une variété de programmes informatiques réalisés au cours de ma formation en école d\'ingénieur.',
        mainPart: [
            {
                title: 'Démineur réseau',
                technologies: 'Java',
                description: 'Ce projet est toujours en cours de conception. Plus d\'informations à venir !',
                illustration: Programing1,
            },
            {
                title: 'Projet optimisation',
                technologies: 'Python',
                description: 'Défi de programmation en binôme, consistant à optimiser un nombre de "surveillants", en fonction de la répartition des "cibles" dans une grille. Nous avons adopté diverses stratégies afin d\'obtenir la solution la plus optimale.',
                illustration: Programing2,
            },
            {
                title: 'Dactylo Race',
                technologies: 'Langage C',
                description: 'Application multijoueurs, dans laquelle nous avons orchestré des processus et des fils de discussion pour créer un jeu. Les participants participent à un défi compétitif qui leur demandait de taper rapidement et avec précision une phrase présentée. Nous avons supervisé des tâches telles que l\'enregistrement des joueurs, l\'affichage des phrases et le chronométrage.Lorsque tous les joueurs ont terminé, le jeu présente un podium, offrant la possibilité de rejouer ou de quitter le jeu.',
                illustration: Programing3,
            },
            {
                title: 'Dictionnaire de prédiction',
                technologies: 'Langage C',
                description: 'Ce projet C portait sur le développement d\'un dictionnaire de prédiction, qui proposait des suggestions de mots basées sur les entrées de l\'utilisateur. Lorsque les utilisateurs saisissent des chaînes de caractères, l\'application propose des choix de mots probables en se référant à un dictionnaire conversationnel existant. Dans les cas où aucune correspondance n\'était trouvée, nous avons mis en œuvre un système logique pour proposer des mots français courants susceptibles de compléter la saisie de l\'utilisateur.',
                illustration: Programing4,
            },
        ],
    },
    embedded: {
        title: 'Systèmes Embarqués',
        description: 'Projet Robot',
        context: 'Dans le cadre de ma formation en école d\'ingénieur, j\'ai eu l\'opportunité de travailler sur un projet de systèmes embarqués. Ce projet s\'est déroulé sur les deux premières années, en binôme avec un camarade de classe.',
        mainPart: [
            {
                title: 'Conception de la carte électronique',
                technologies: '',
                description: 'Dans un premier temps, nous avons été amenés à étudier les différents composants électroniques nécessaires à la réalisation de notre projet. Nous avons ensuite conçu une carte électronique, qui permettait de contrôler les différents moteurs du robot, et de communiquer avec un ordinateur via une liaison série. Différents capteurs étaient également présents sur la carte, pour permettre au robot de se déplacer de manière autonome. Nous avons enfin pu simuler le comportement du robot sur le logiciel de simulation Proteus.',
                illustration: Embedded1,
            },
            {
                title: 'Développement du programme de contrôle',
                technologies: 'C Embarqué, STM32CUbeIDE',
                description: 'Par la suite, nous avons été amenés à programmer la carte électronique, à travers l\'utilisation du langage C embarqué. Ce programme permettait au robot de quadriller une zone ciruclaire devant lui, et d\'identifier un obstacle proche. Nous avons plus tard amélioré ce projet, par l\'utilisation cette fois du microcontrôleur STM32, et du logiciel STM32CubeIDE. Le robot était alors capable de se déplacer de manière autonome, afin de se garer dans une zone de stationnement.',
                illustration: Embedded2,
            },
        ],
    },
    robotics: {
        title: 'Robotique',
        description: 'Élaboration d\'un bras d\'exosquelette',
        context: 'Durant les classes préparatoires, j\'ai réalisé un mon TIPE (Travail d\'Initiative Personnelle Encadré) sur le thème de la robotique. Ce projet a été mené en collaboration avec un camarade de classe et a été présenté lors des concours d\'entrée aux écoles d\'ingénieurs. Nous nous étions fixés l\'objectif de concevoir un bras d\'exosquelette, capable d\'acompagner les mouvements de l\'utilisateur lors de la réalisation de tâches répétitives.',
        mainPart: [
            {
                title: 'Création de pièces mécaniques',
                technologies: 'Solidworks',
                description: 'Nous avons commencé par modéliser différentes pièces mécaniques sur Solidworks. Ces pièces devaient pouvoir s\'incorporer sur une attèle de rééducation, qui nous servait de base pour le projet. Ainsi, nous avons conçu une pièce permettant de fixer un moteur sur l\'attèle, le plus proche de la liaison pivot située sur le coude.',
                illustration: Robotics1,
            },
            {
                title: 'Mise en place du système de commande et de contrôle',
                technologies: 'Arduino',
                description: 'Par la suite, nous avons mis en place un système de commande et de contrôle pour le bras d\'exosquelette. Nous avons utilisé une carte Arduino pour contrôler le moteur, et nous avons développé un programme en C++ pour gérer les différentes tâches du bras.',
                illustration: Robotics2,
            },
        ],
    }
};

function Project(props) {

    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    return (
        <div className='absolute h-full w-full z-50' style={{ top: `${props.scrollY}px`, backdropFilter: 'blur(10px)' }}>
            <div className='container-fluid h-full flex justify-center items-center'>
                <div className='container h-5/6'>
                    <div className='flex flex-col justify-center items-center'>
                        <h1 className='outlined-text'>{contentOfPopUp[props.tab].title}</h1>
                        <h2>{contentOfPopUp[props.tab].description}</h2>
                    </div>
                    <div id="popUpContent" className='container-fluid h-full'>
                        <h3 className='text-align'>{contentOfPopUp[props.tab].context}</h3>
                        {contentOfPopUp[props.tab].mainPart.map((part, index) => (
                            (index % 2 === 0 && isClient && window.innerWidth > 768) ? (
                                <div className='mt-2 md:mt-4 lg:mt-8 w-full h-2/3 flex flex-col md:flex-row' key={index}>
                                    <div className='h-full w-full md:w-1/2 flex flex-col justify-center'>
                                        <h2>{part.title}</h2>
                                        <h3>{part.technologies}</h3>
                                        <p className='text-align'>{part.description}</p>
                                    </div>
                                    <div className='h-1/2 md:h-full w-full md:w-1/2 flex justify-center items-center p-16' style={{ overflow: 'hidden' }} >
                                        <Image src={part.illustration} alt={part.title} />
                                    </div>
                                </div>
                            ) : (index % 2 === 1 && isClient && window.innerWidth > 768) ? (
                                <div className='mt-2 md:mt-4 lg:mt-8 w-full h-2/3 flex flex-col md:flex-row' key={index}>
                                    <div className='h-1/2 md:h-full w-full md:w-1/2 flex justify-center items-center p-20' style={{ overflow: 'hidden' }} >
                                        <Image src={part.illustration} alt={part.title} />
                                    </div>
                                    <div className='h-full w-full md:w-1/2 flex flex-col justify-center'>
                                        <h2>{part.title}</h2>
                                        <h3>{part.technologies}</h3>
                                        <p className='text-align'>{part.description}</p>
                                    </div>
                                </div>) : (<div className='mt-1 md:mt-2 lg:mt-4 w-full h-2/3 flex flex-col md:flex-row' key={index} style={{ height: '150vh' }}>
                                    <div className='h-full w-full md:w-1/2 flex flex-col justify-center'>
                                        <h2>{part.title}</h2>
                                        <h3>{part.technologies}</h3>
                                        <p className='text-align'>{part.description}</p>
                                    </div>
                                    <div className='h-1/2 md:h-full w-full md:w-1/2 flex justify-center items-center p-20' style={{ overflow: 'hidden' }} >
                                        <Image src={part.illustration} alt={part.title} />
                                    </div>
                                </div>)))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Project;