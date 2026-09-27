## Contexte

En guise de projet personnel en parallèle des cours de dernière année aux Mines, je me suis lancé dans le développement d'un système de vidéo surveillance, accessible en ligne.

## Développement du montage

J'ai conçu et assemblé les différents composants matériels nécessaires au fonctionnement du système, grâce notamment à des cartes Arduino et ESP32. L'idée principale du montage était d'avoir une carte Arduino centrale, qui gérait l'ensemble des informations qui lui étaient transmises. Différents capteurs étaient connectés afin de récolter des données sur l'environnement (lumière, mouvement, son). Puis, cette carte principale communiquait avec les autres ESP32 via bluetooth, pour récupérer les flux vidéo ou photos qui étaient capturés. J'ai notamment utilisé un capteur PIR pour détécter quand prendre une photo (cas d'une intrusion dans le domicile).

## Développement d'une API

Par la suite, j'ai développé une API RESTful en Django pour permettre à l'application de communiquer avec le système de vidéo surveillance. Cette API gérait les requêtes des utilisateurs, telles que l'authentification, la récupération des flux vidéo et la gestion des paramètres de sécurité. Toutes les requêtes étaient effectuées par la carte Arduino, de façon autonome, afin de stocker les photos prises ou les données récupérées.

## Développement d'une interface utilisateur

Enfin, j'ai développé une interface utilisateur en React pour permettre aux utilisateurs d'interagir avec le système de vidéo surveillance. Cette interface affichait les photos prises sous forme de visionneuse en ligne, et offrait une vue d'ensemble des données collectées par les capteurs.
