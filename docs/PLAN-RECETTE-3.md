# Plan d'implémentation — 3ᵉ passe de recette (retours du 2026-10-02)

5 retours, indépendants les uns des autres (fichiers distincts) : tout tourne
en parallèle, aucune vague. Tickets `.claude/tickets/PORT-063` à `PORT-067`.
Procédure : `docs/PROCEDURE-TICKET.md` (+ `docs/GUIDE-3D.md` pour PORT-066).

## Ce qui a été vérifié avant d'écrire les tickets

- **Icônes Groot/Eminem** : diagnostic confirmé en comparant les 15 icônes du
  hero sur un fond neutre. 13 sont des silhouettes blanches pures (la teinte
  par thème de PORT-052 leur va très bien) ; seules **Groot** et **B-Rabbit**
  (le personnage d'Eminem dans *8 Mile*) ont un dessin à deux teintes (blanc
  + traits noirs/gris) — c'est pour ça que la teinte uniforme du thème clair
  les écrase en un bloc grisâtre illisible. Corrigé en recolorant ces deux-là
  spécifiquement, images inversées déjà générées et vérifiées par capture
  (voir PORT-063).
- **Fond des cartes en thème clair** : `--surface-raised` vaut aujourd'hui
  `#efefeb`, un gris chaud plat. Remplacé par `#eef2f4` (teinte froide douce,
  dérivée du bleu de la marque) : contraste texte quasiment identique
  (vérifié : 15.45:1 au lieu de 15.10:1), juste moins terne.
- **Train SNCF** : ce n'est plus une scène 3D (retirée en M7), c'est le petit
  SVG 2D ajouté par PORT-055 — deux rectangles avec de gros ronds en guise de
  roues, qui ressemble effectivement à un jouet en bois. Redessiné en profil
  TGV (nez plongeant, bas et long, bandeau de vitres continu, pas de roues
  visibles, pantographe, liseré de couleur) et **rendu/vérifié dans les deux
  thèmes** avant d'écrire le ticket — le SVG du ticket est déjà le résultat
  validé, pas un brouillon.
- **Compétences GCII** : Git et TypeScript existent déjà comme identifiants
  de logo. Pour Copilot CLI, le vrai logo « GitHub Copilot » a été récupéré
  (Simple Icons, licence CC0) avec sa couleur de marque officielle
  (« Copilot Purple », `#8534F3`, brand.github.com) — aucune icône inventée.

## Tableau des tickets

| Ticket | Titre | Modèle | Fichiers |
| --- | --- | --- | --- |
| PORT-063 | Hero : couleurs correctes pour Groot et B-Rabbit en thème clair | haiku | `hero/HeroGlobe.tsx`, `hero/heroIcons.js` |
| PORT-064 | Thème clair : fond de carte moins terne (`--surface-raised`) | haiku | `src/app/app.css` |
| PORT-065 | SNCF : le petit train 2D ressemble à un TGV | haiku | `demos/SncfMiniTrainDemo.tsx` |
| PORT-066 | Safran : vaisseau plus reconnaissable (ou silhouette différente) | opus | `demos/SafranEarthDemo.tsx`, `i18n/namespaces/demos.ts` |
| PORT-067 | GCII : ajouter Git, TypeScript, Copilot CLI | haiku | `data/projects.ts`, `Banner.jsx`, `ProjectPage.tsx` |

Lancement : les 5 en parallèle, aucune dépendance entre eux ni avec un
ticket M7 (tous déjà fusionnés).
