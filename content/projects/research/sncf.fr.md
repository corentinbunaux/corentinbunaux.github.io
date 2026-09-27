## Contexte

Ce projet faisait office de projet de fin d'études à l'école des Mines. Il avait pour objectif de répondre à un besoin spécifique de la SNCF en matière de recherche et d'innovation. Par groupe de 4 étudiants, nous avons travaillé durant 1 mois sur l'optimisation d'un problème de génération de trajets propre à la SNCF.

## Problématique

Afin de représenter les différents trajets possibles sur les lignes de chemins de fer, la SNCF se munie de Graphiques Espace Temps, qui permettent de représenter l'utilisation des différentes lignes par différents trains, en fonction du temps. Un des problèmes les plus ennuyeux de ce système est la lisibilité de ces graphiques. En effet, plus un grand nombre de gares sont représentées, moins il est aisé de lire le graphique. Ainsi le projet qui nous a été confié était un projet d'optimisation de ces graphiques.

## Solution envisagée

Nous avons proposé de solutionner ce problème en repensant la manière dont les trajets étaient générés sur ces graphiques. Nous avons utilisé la topologie du réseau de chemins de fer pour optimiser la représentation des trajets. Cette première solution a permis de réduire le nombre de gares représentées sur chaque graphique, améliorant ainsi leur lisibilité. Néanmoins, il restait encore des améliorations à apporter, puisque cette représentation était trop éloignée de la réalité terrain.

## Solution améliorée

Nous avons affiné notre approche en intégrant les flux de trafic réels dans notre modèle. Ainsi, la génération des trajets tenait compte des flux réels des trains sur une voie donnée. Cette nouvelle approche a permis d'améliorer significativement la pertinence des trajets générés, en les rendant plus réalistes et exploitables, mais en détériorant la lisibilité des graphiques. Finalement, notre solution a tout de même amélioré la situation en proposant des graphiques plus clairs et plus informatifs, en réduisant par 3 (en moyenne) le nombre de gares représentées.
