## Contexte

Dans le cadre de ma formation en école d'ingénieur, j'ai eu l'opportunité de travailler sur un projet de développement d'un jeu du démineur, qui accompagnait un cours sur le développement Java.

## Partie classique

Dans un premier temps, j'ai développé la logique du jeu traditionnel, ainsi qu'une interface graphique simple avec la librairie Swing. Le but de ce cours était avant tout de se concentrer sur les aspects backend de l'app. Plusieurs grilles de différents niveaux étaient générées de manière aléatoire, avec un nombre fixé de bombes pour chacun. La propagation lors du clic sur une case vide était active.

## Jeu multijoueur

Dans un second temps, j'ai ajouté une fonctionnalité de jeu multijoueur, permettant à plusieurs utilisateurs de se connecter et de jouer ensemble. J'ai utilisé des sockets pour gérer la communication entre les clients et le serveur, et j'ai dû repenser certaines parties de la logique du jeu pour gérer les interactions entre les joueurs. La propagation du clic sur une case vide était cette fois-ci désactivée, car les règles du jeu multijoueur différaient de celles du jeu classique. Dans ce mode, 1 clic correspondait à 1 point, et le but était d'obtenir le maximum de points sur une grille, sans cliquer sur une bombe (le joueur était éliminé auquel cas).
