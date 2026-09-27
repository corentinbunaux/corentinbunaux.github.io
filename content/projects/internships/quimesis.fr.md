## Contexte

Dans le cadre de ma seconde année d'école d'ingénieur, j'ai eu l'opportunité de réaliser un stage d'ingénierie logicielle chez Quimesis, une entreprise Belge spécialisée dans trois domaines : la mécanique, l'électronique et l'informatique. J'ai été amené à travailler sur un projet informatique dans le domaine médical.

## Amélioration d'algorithmes de segmentation dentaire

La première étape de ce stage a consisté à améliorer les algorithmes de segmentation dentaire, qui permettent de séparer une dent de ses voisines et de la gencive. Pour cela, j'ai utilisé la librairie VTK en C++, qui permet de manipuler des images 3D. J'ai ajouté une fonctionnalité permettant de déplacer les points de la frontière entre une dent et ses voisines / la gencive (calculée mathématiquement), afin de retracer cette même frontière à la main, de manière précise.

## Développement d'une application web

Dans un but de faciliter l'intégration du logiciel de segmentation dentaire dans le quotidien des dentistes, j'ai développé une application web en React.js, intégrant la librarie VTK. Cette application permet de visualiser les images 3D des dents, de les segmenter, et de les exporter, le tout depuis un navigateur web. Elle est également dotée de fonctionnalités de visualisation supplémentaires. Cette étape m'a permis de comprendre les principes de fonctionnement d'applications full-stack.

## Mise en place d'un environnement de développement optimisé

Afin que mon travail puisse être repris par les développeurs de l'entreprise, j'ai mis en place un environnement de développement optimisé. Pour cela, j'ai utilisé WebAssembly, qui permet de compiler du code C++ en code JavaScript. Dans un premier temps, cette technologie permettait d'optimiser la fluidité du rendu de l'application. Par la suite, j'ai mis en place un environnement de "Hot-Reload" qui permet de recharger automatiquement l'application lorsqu'un changement est effectué dans le code source, sans recompilation complète du C++. 
