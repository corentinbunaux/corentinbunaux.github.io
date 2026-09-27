# Plan d'implémentation — recette utilisateur du 2026-09-26

Source : `recette-utilisateur.md` (16 retours de Corentin) + les réponses
données en session le 2026-09-27. Tickets : `.claude/tickets/PORT-024` à
`PORT-051`. Procédure d'exécution commune : `docs/PROCEDURE-TICKET.md` ; règles communes des scènes 3D : `docs/GUIDE-3D.md`.
Branche cible de toutes les fusions : `refonte-2026`.

## 1. Ce qui a été challengé, et ce qui a été décidé

| # | Retour | Point soulevé | Décision |
| --- | --- | --- | --- |
| 1, 5 | Hero trop chargé ; intégrer le Profil | Bandeau + mesh + roue = 3 animations concurrentes. La maquette (zone ①) prévoit : texte à gauche, avatar + globe à droite. | Hero façon maquette, **une seule** scène 3D : un globe filaire autour de l'avatar sur lequel orbitent les icônes de la roue actuelle. Bandeau vert, mesh de fond et roue CSS supprimés. Le bloc « Profil » est fusionné dans le hero, la section `#profile` disparaît (le lien « Profil » pointe sur `#home`). Le bandeau défilant des technos (Banner) est retiré de la home : les pastilles technos du hero le remplacent. |
| 2 | Menu de langue | Deux boutons « FR / EN » de largeur différente, style non homogène. | Bouton unique **icône globe + code langue** (largeur fixe), qui ouvre un petit menu « Français / English ». Aucune animation de transition. |
| 3, 4 | Thème clair/sombre | Les couleurs sont en dur dans plusieurs composants et dans les scènes three.js ; faire le thème **avant** les nouvelles scènes évite de les reprendre. | Palette sombre inchangée ; palette claire équivalente (contrastes AA vérifiés). Défaut = préférence système ; bouton lune/soleil pour forcer. Script anti-flash avant hydratation. Les scènes 3D lisent leurs couleurs via un hook `useThemeColors`. |
| — | En-tête | La bascule de langue existe en double (navbar + fil d'Ariane des pages projet). | **Un en-tête commun** (`SiteHeader`) sur la home et toutes les pages projet : navigation, langue, thème. |
| 6 | Parcours | Stages et formation se chevauchent dans le temps (ex. Quimesis 2024 pendant les Mines). Une seule frise mélangée devient illisible. | **Deux pistes** côte à côte : Expérience / Formation, chacune en ordre décroissant. Formation : Mines ISMIN (Gardanne, 2022-2025), CPGE PSI (Caen, 2021-2022) et PCSI (Le Havre, 2020-2021) — les deux liées au TIPE —, Bac S spé. maths mention TB (Lillebonne, 2020). Deux petites icônes 3D (diplôme, mallette) en tête de piste. |
| 7 | GCII : aperçu | La vraie cartographie Enedis est confidentielle. | **Illustration générée** (SVG) : l'Hexagone stylisé parcouru d'un réseau de postes et de lignes. Aucune donnée réelle. |
| 7 | Articles en fichiers séparés | JSON = échappements pénibles à la main ; Markdown complet = dépendance. | **Markdown simple** (titres `##` + paragraphes), un fichier par langue et par projet dans `content/projects/`, lu au build. `pageContent` disparaît de `projects.ts`. |
| 7 | Logos technos dans l'article, « En bref » décalé | Le `sticky` de « En bref » ne colle pas (`overflow-x: hidden` sur `body`) et l'en-tête fixe va le recouvrir. | Pastilles logo + libellé dans l'en-tête d'article ; `overflow-x: clip` ; « En bref » aligné sur le haut de l'article et collé sous l'en-tête. |
| 8, 9, 11, 13 | Scènes 3D par projet | Un accent flottant de 160 px est trop petit pour un train, une voiture qui se gare ou une mâchoire manipulable, et il se superposait au titre. | Nouvelle **section « Démo »** en bas de chaque page projet concernée, pleine largeur (16:9). Les scènes 3D restent desktop uniquement (≥ 1024 px, sans « réduire les animations ») ; les jeux 2D fonctionnent partout. |
| 9 | Safran : Star Wars | Propriété intellectuelle de Lucasfilm. | Clin d'œil **stylisé** (chasseur à ailes en X générique, pas de nom ni de logo), apparition tardive. Terre texturée avec **NASA Blue Marble** (domaine public, téléchargement approuvé). |
| 8 | SNCF | Un train seul n'illustre pas le sujet (lisibilité des graphiques espace-temps). | **Les deux** : un train 3D sur une voie + un graphique espace-temps animé (2D, données fictives). |
| 10 | Démineur | — | 9×9, 10 mines, chrono, mode classique seul, jouable souris/tactile/clavier. |
| 11 | Quimesis : mâchoire | Aucun modèle 3D libre de droits fiable ; un scan réel serait confidentiel. | Mâchoire **procédurale** (arcades de dents simples), rotation à la souris, ouverture au clic, survol des dents. L'animation « fragments » actuelle est conservée comme première démo. |
| 12 | Programmation | Dactylo Race est multijoueur en réseau (sockets) : impossible sur un site statique. | 3 démos : **Surveillants** (grille 10×10 avec murs, 13 cibles, optimum = 6, calculé dans le navigateur), **Dactylo Race solo**, **Dictionnaire de prédiction** (autocomplétion). |
| 14 | À propos | Le bouton PUSH a « glissé » car la mise en page utilise des colonnes CSS (`columns-2`) : le contenu ajouté (centres d'intérêt) l'a fait passer dans l'autre colonne. Le SVG du tennisman n'a pas de groupe « bras/raquette » identifiable. | Grille à deux colonnes stricte ; sudoku retiré ; natation / escalade / échecs en « archivées » ; icônes lucide (tennis dessiné à la main). Bras + raquette **redessinés** en groupe séparé pour animer une frappe quand la balle arrive. |
| 15 | Indicateur de section | Le « scroll fluide cassé » (PORT-022) était un faux positif : l'onglet d'automatisation était en arrière-plan. | PORT-022 clos. Liens de nav en ancres natives + `scroll-behavior: smooth` CSS ; soulignement de la section courante via `IntersectionObserver`. |
| 16 | Texte « Ouvert aux missions… » | — | Supprimé (FR + EN). |

Nouvelle dépendance approuvée : **`lucide-react`** (icônes). Aucune autre.

## 2. Hypothèses à confirmer (non bloquantes, valeur par défaut prise)

- **Surveillants** : un surveillant peut être placé sur une case cible (il la
  couvre alors) mais pas sur un mur ; les cibles ne bloquent pas la vue.
- **Démineur** : 9×9 / 10 mines (grille « débutant » classique).
- **Mines** : le diplôme ISMIN est présenté comme obtenu en 2025.
- **Banner** : le bandeau défilant des technos quitte la home (le composant
  reste, ses icônes servent aux pastilles).

## 3. Vagues d'exécution (du moins au plus complexe)

Tous les tickets d'une même vague peuvent tourner **en même temps**, chacun
dans sa worktree. Une vague commence quand les dépendances de ses tickets sont
fusionnées (pas forcément toute la vague précédente).

```
Vague 1 ─ fondations (3 en parallèle)
  024 dictionnaire découpé ─┐        025 CSS scroll/sticky ─┐      026 thème + lucide ─┐
                            │                               │                          │
Vague 2 ─ petites évolutions (7 en parallèle)                                          │
  027 footer      ◄── 024                                                              │
  028 SiteHeader  ◄── 024, 025, 026                                                    │
  029 À propos    ◄── 024, 026                                                         │
  030 Parcours    ◄── 024, 026                                                             │
  031 section Démo◄── 024, 026                                                         │
  032 visuel GCII (aucune)                                                             │
  033 logos techno◄── (aucune)                                                         │
                                                                                        │
Vague 3 ─ fonctionnalités (10 en parallèle)                                             │
  034 indicateur nav ◄── 028        035 « En bref » ◄── 025, 028, 031, 033                  │
  036 articles .md   ◄── 031, 033   037 hero + profil ◄── 026, 028, 033                     │
  038 démineur  039 surveillants  040 dactylo  041 prédiction  042 espace-temps ◄── 031  │
  043 tennisman ◄── 029                                                                 │
                                                                                        │
Vague 4 ─ scènes 3D (7 en parallèle, toutes ◄── 031)                                    │
  044 globe du hero ◄── 037   045 Safran   046 train SNCF   047 voiture                 │
  048 exosquelette   049 mâchoire   050 icônes 3D du Parcours ◄── 030                   │
                                                                                        │
Vague 5 ─ consolidation                                                                 │
  051 ARCHITECTURE/PASSATION/BACKLOG + recette thème clair & mobile ◄── tous            │
```

## 4. Tableau des tickets

Estimation en demi-journées. **Modèle** : `haiku` = instructions exhaustives,
aucune décision à prendre ; `sonnet` = demande du jugement (mise en page à
ajuster à l'œil, géométrie 3D, API React délicate).

| Ticket | Titre | Modèle | Est. | Dépend de | Fichiers principaux |
| --- | --- | --- | --- | --- | --- |
| PORT-024 | Dictionnaire i18n découpé par namespace | haiku | 0.5 | — | `src/i18n/**` |
| PORT-025 | CSS : `overflow-x: clip`, scroll fluide natif, hauteur d'en-tête | haiku | 0.25 | — | `app.css` |
| PORT-026 | Thème clair/sombre + installation de lucide-react | sonnet | 1 | — | `src/theme/**`, `layout.tsx`, `app.css`, `package.json` |
| PORT-027 | Footer : retirer la phrase de disponibilité | haiku | 0.1 | 024 | `footer.jsx`, `namespaces/footer.ts` |
| PORT-028 | En-tête commun (nav, langue globe, thème lune/soleil) | sonnet | 1 | 024, 025, 026 | `SiteHeader.tsx`, `page.tsx`, `ProjectPage.tsx`, `navbar.jsx` (supprimé) |
| PORT-029 | À propos : intérêts actifs/archivés, icônes, bouton PUSH | haiku | 0.5 | 024, 026 | `aboutmeSection.jsx`, `namespaces/about.ts` |
| PORT-030 | Parcours : ordre décroissant, deux pistes, formation | haiku | 0.5 | 024, 026 | `journeySection.tsx`, `src/data/education.ts` |
| PORT-031 | Section « Démo » + registre + socle three.js | sonnet | 1 | 024, 026 | `src/components/demos/**`, `ProjectPage.tsx` |
| PORT-032 | Illustration GCII (SVG généré) | haiku | 0.25 | — | `scripts/`, `assets/images-src/img/`, `projects.ts` |
| PORT-033 | Logos des technos dans l'en-tête d'article | haiku | 0.25 | — | `TechBadge.tsx`, `ProjectPage.tsx` |
| PORT-034 | Soulignement de la section courante dans la nav | haiku | 0.25 | 028 | `SiteHeader.tsx` |
| PORT-035 | « En bref » : alignement + sticky sous l'en-tête | sonnet | 0.5 | 025, 028, 031, 033 | `ProjectPage.tsx` |
| PORT-036 | Articles en Markdown (FR/EN) lus au build | sonnet | 1 | 031, 033 | `content/projects/**`, `src/lib/articles.ts`, 12 `page.tsx`, `projects.ts` |
| PORT-037 | Hero façon maquette + fusion du Profil | sonnet | 1 | 026, 028, 033 | `homepage.jsx`, `page.tsx`, `profileSection.jsx` (supprimé) |
| PORT-038 | Démo : démineur 9×9 | haiku | 0.5 | 031 | `demos/Minesweeper*` |
| PORT-039 | Démo : surveillants 10×10 | haiku | 0.5 | 031 | `demos/Guards*` |
| PORT-040 | Démo : Dactylo Race solo | haiku | 0.5 | 031 | `demos/Typing*` |
| PORT-041 | Démo : dictionnaire de prédiction | haiku | 0.5 | 031 | `demos/Predict*` |
| PORT-042 | Démo : graphique espace-temps SNCF (2D) | haiku | 0.5 | 031 | `demos/SpaceTime*` |
| PORT-043 | Tennisman : bras redessiné + frappe animée | sonnet | 1 | 029 | `federer.jsx`, `aboutmeSection.jsx`, `app.css` |
| PORT-044 | Hero : globe filaire + icônes en orbite (3D) | sonnet | 1 | 031, 037 | `hero/HeroGlobe*` |
| PORT-045 | Démo 3D Safran : Terre, satellites, chasseur stylisé | sonnet | 1 | 031 | `demos/SafranEarth*`, texture NASA |
| PORT-046 | Démo 3D SNCF : train sur voie | sonnet | 1 | 031 | `demos/SncfTrain*` |
| PORT-047 | Démo 3D Systèmes embarqués : voiture qui se gare | sonnet | 1 | 031 | `demos/ParkingCar*` |
| PORT-048 | Démo 3D Robotique : bras d'exosquelette | sonnet | 1 | 031 | `demos/ExoArm*` |
| PORT-049 | Démo 3D Quimesis : mâchoire interactive | sonnet | 1 | 031 | `demos/QuimesisJaw*` |
| PORT-050 | Parcours : icônes 3D diplôme / mallette | sonnet | 0.5 | 030, 031 | `journey/TrackIcon3D*` |
| PORT-051 | Consolidation : docs + recette clair/mobile | sonnet | 0.5 | tous | `ARCHITECTURE.md`, `PASSATION.md`, `docs/BACKLOG.md` |

Total ≈ 17 demi-journées de travail séquentiel ; avec le parallélisme, 5
vagues.

## 5. Comment les tickets évitent de se marcher dessus

- **Dictionnaire** : PORT-024 découpe `dictionary.ts` en un fichier par
  namespace et **pré-enregistre** les namespaces futurs (`header`, `demos`,
  `minesweeper`, `guards`, `typing`, `predict`) vides. Ensuite chaque ticket
  ne modifie que **son** fichier de namespace : plus de conflit sur l'index.
- **Démos** : PORT-031 crée le registre avec toutes les démos déjà listées
  (`ready: false`) et un fichier composant vide pour chacune. Un ticket de démo
  remplace son propre fichier et passe **sa** ligne à `ready: true`.
- **Documentation** : aucun ticket ne touche `ARCHITECTURE.md` /
  `PASSATION.md` ; chacun remplit « Notes pour la consolidation », que
  PORT-051 reporte.
- **`ProjectPage.tsx`** reste le point chaud (5 tickets). Chacun y touche une
  zone distincte ; la règle de résolution est dans la procédure.

## 6. Lancer une vague en parallèle

Dans une session Claude Code sur `refonte-2026`, par exemple pour la vague 2 :

> Exécute en parallèle les tickets PORT-027, PORT-029, PORT-030, PORT-032 et
> PORT-033 avec des sous-agents Haiku, et PORT-028 et PORT-031 avec des
> sous-agents Sonnet. Chaque sous-agent suit `docs/PROCEDURE-TICKET.md` et
> son ticket, dans sa propre worktree, et fusionne lui-même dans
> `refonte-2026`.

Les fusions arrivent l'une après l'autre ; un sous-agent qui trouve un conflit
applique la table de résolution de la procédure.
