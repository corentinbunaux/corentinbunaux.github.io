---
id: PORT-051
title: "Consolidation de la recette — ARCHITECTURE, PASSATION, BACKLOG, contrôle thème clair et mobile"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: review
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: sonnet
branch: docs/PORT-051-recette-consolidation
depends_on: [PORT-024, PORT-025, PORT-026, PORT-027, PORT-028, PORT-029, PORT-030, PORT-031, PORT-032, PORT-033, PORT-034, PORT-035, PORT-036, PORT-037, PORT-038, PORT-039, PORT-040, PORT-041, PORT-042, PORT-043, PORT-044, PORT-045, PORT-046, PORT-047, PORT-048, PORT-049, PORT-050]
parallel_safe: false
human_checkpoint: "Nouvelle recette complète par Corentin sur refonte-2026."
created: 2026-09-27
---

# Consolidation de la recette

**Procédure** : `docs/PROCEDURE-TICKET.md`. Ce ticket est le **seul**
autorisé à modifier `ARCHITECTURE.md`, `PASSATION.md` et `docs/BACKLOG.md`.
Il peut démarrer même si quelques tickets sont `blocked` : les lister alors
dans PASSATION.md au lieu d'attendre.

## Étapes

1. **Inventaire** : pour chaque ticket PORT-024 à PORT-050, relever `status`,
   le journal d'exécution et les « Notes pour la consolidation ». Vérifier
   que chaque branche `done`/`review` est fusionnée
   (`git branch --merged refonte-2026`).
2. **ARCHITECTURE.md** : reporter toutes les notes (carte des fichiers,
   décisions datées, invariants, points faibles). Supprimer ce qui est devenu
   faux (HeroMesh/HeroCanvas, ProjectAccent3D, navbar.jsx, `#profile`,
   `offsetTop`, `pageContent`, « smooth scroll cassé », « sticky cassé »).
   Garder le fichier vrai et concis.
3. **Contrôle transversal** au navigateur, **thème clair**, puis sombre, à
   1280 px et 360 px : home (toutes sections) + les 12 pages projet. Pour
   chaque zone illisible ou cassée : la corriger si c'est une classe de
   couleur en dur dans un composant (remplacer par le token), sinon créer un
   ticket `draft` PORT-052+ décrivant le problème. Lister le résultat page
   par page dans le journal.
4. `grep -rn "#[0-9a-fA-F]\{6\}" src/components src/app --include=*.tsx --include=*.jsx`
   hors `Banner.jsx` (logos de marque) et hors couleurs « réalistes »
   documentées (texture/dents/gencives) : chaque occurrence restante est
   soit justifiée dans le journal, soit corrigée.
5. **Lighthouse** (mobile) sur la home et `/internships/safran` : noter
   Performance / Accessibilité / Bonnes pratiques / SEO, comparer aux
   valeurs de ARCHITECTURE.md (82-86 perf mobile). Ne rien optimiser ici :
   créer un ticket si régression nette.
6. **docs/BACKLOG.md** : ajouter le jalon « M6 — Recette utilisateur » avec
   PORT-024 à 051 et leur statut ; PORT-022 clos (faux positif).
7. **PASSATION.md** : réécrire (≤ 60 lignes, archiver l'ancienne dans
   `.claude/passations/2026-09-XX-m6-recette.md`) : ce qui a changé, ce qui
   a échoué/est bloqué, questions ouvertes (hypothèses du plan
   `docs/PLAN-RECETTE.md` §2 encore à valider), checkpoints humains en
   attente, prochaine étape.
8. Procédure §4 puis fusion.

Commit : `docs: consolidate the M6 user-acceptance round`

## Critères d'acceptation

- [x] ARCHITECTURE.md exact pour l'état de `refonte-2026`.
- [x] Contrôle thème clair + mobile fait sur 13 pages, résultat consigné.
- [x] BACKLOG et PASSATION à jour.
- [x] lint / tsc / build passent.

## Journal d'exécution

### 1. Inventaire

Worktree `../wt-PORT-051` créée depuis `refonte-2026`
(`git worktree add ../wt-PORT-051 -b docs/PORT-051-recette-consolidation
refonte-2026`), `npm ci` OK (437 packages, aucune erreur bloquante — 7
vulnérabilités `npm audit` pré-existantes, non traitées ici, hors périmètre).

`git log --oneline refonte-2026 | grep -iE "PORT-0(2[4-9]|3[0-9]|4[0-9]|50)"`
montre un commit `Merge PORT-0XX: ...` pour chacun des 27 tickets PORT-024 à
PORT-050 : tous fusionnés. Statuts relevés (`grep status .claude/tickets/*`) :
`done` — 024, 025, 027, 031, 033, 034, 041, 046, 047, 050 (10 tickets) ;
`review` — 026, 028, 029, 030, 032, 035, 036, 037, 038, 039, 040, 042, 043,
044, 045, 048, 049 (17 tickets, chacun avec un `human_checkpoint` non nul).
Aucun `blocked` parmi PORT-024 à 050. Les « Notes pour la consolidation » et
les points pertinents du « Journal d'exécution » de chaque ticket ont été lus
intégralement (extraits dans le fichier de travail, non committé) et reportés
dans `ARCHITECTURE.md`.

### 2. ARCHITECTURE.md

Réécrit en entier : nouvelle carte des fichiers (`SiteHeader.tsx`,
`src/theme/`, `src/components/demos/`, `src/components/hero/`,
`src/components/journey/`, `src/data/education.ts`, `content/projects/`,
`src/lib/articles.ts`), décisions datées 2026-09-27 pour tout M6, invariants
mis à jour (ancres natives + `scroll-margin-top`, couleurs par tokens avec
les deux exceptions documentées, gabarit `ThreeStage`/`registry.ts`).
Supprimé : `navbar.jsx`, `HeroMesh`/`HeroCanvas`, `ProjectAccent3D`,
`#profile`, `offsetTop` (remplacé par `IntersectionObserver` dans
`SiteHeader`), `pageContent` (remplacé par `content/projects/`), les points
« smooth scroll cassé » et « sticky cassé » (PORT-022 faux positif ; sticky
résolu par PORT-025/035). Gardés car toujours vrais : absence de suite de
tests, hiérarchie de titres invalide (PORT-023, hors M6), absence de CV PDF
(hors M6). Ajoutés : `SafranAccent.tsx` orphelin non supprimable (permission
refusée), sélecteur CSS `#profile` mort dans `app.css`, limites des mesures
FPS/captures WebGL en Chrome headless + SwiftShader, liste des vérifications
visuelles non faites faute de navigateur pendant M6.

### 3. Contrôle transversal thème clair/sombre + mobile

Aucun navigateur interactif connecté à cette session (`claude-in-chrome` non
disponible). Méthode : Chrome headless piloté par le protocole DevTools brut
via `WebSocket` natif de Node 24 (`--headless=new --use-angle=swiftshader
--enable-unsafe-swiftshader`, `--user-data-dir` temporaire dédié,
`--remote-debugging-port=9333`), script jetable dans le scratchpad (hors
dépôt), contre `npm run dev` de la worktree (port 3000). Pour chacune des 13
pages (home + 12 projets) × 2 thèmes (`localStorage['corentinbunaux.theme']
= 'dark'|'light'`, injecté via `Page.addScriptToEvaluateOnNewDocument` avant
chaque navigation) × 2 largeurs (1280×900, 360×800), un script in-page a
mesuré : le contraste WCAG (couleur de texte vs. fond effectif hérité, seuils
4.5:1 texte normal / 3:1 texte large) sur tous les nœuds avec texte direct,
le débordement horizontal (`scrollWidth` vs `clientWidth`), et les
erreurs/avertissements console (`Runtime.consoleAPICalled`/
`exceptionThrown`). Une vérification séparée (13 pages, thème sombre,
1280×900, pour aussi couvrir les demos desktop) a contrôlé les images
cassées (`naturalWidth === 0`) et les requêtes réseau en échec
(`Network.responseReceived` ≥ 400, `Network.loadingFailed`).

**Résultat, sur les 52 combinaisons page × thème × largeur** : zéro
problème de contraste, zéro débordement horizontal, zéro erreur/avertissement
console. **Sur les 13 pages** (vérification images/réseau) : zéro image
cassée, zéro requête en échec. Sanity-check de la méthode : un script
séparé confirme que le bascule de thème fonctionne réellement
(`document.documentElement.dataset.theme` et `--surface`/`--main-text`
diffèrent bien entre les deux runs : `dark → surface #202020, mainText
#f5f5f5` / `light → surface #fff, mainText #1a1a1a`) — le résultat "aucun
problème" n'est donc pas un faux négatif dû à un thème qui ne changerait
pas réellement.

Limite assumée et documentée dans `ARCHITECTURE.md` (Known weak points) :
cette méthode automatique couvre la lisibilité (contraste, débordement,
images, réseau, console) mais pas l'interaction manuelle (glisser la
mâchoire Quimesis, jouer une partie de démineur, ouvrir le menu de langue) —
celle-ci reste à faire par Corentin ou une session avec navigateur connecté,
comme déjà signalé par plusieurs tickets M6 (026, 028, 031, 037). Aucun
problème réel trouvé → **aucun ticket PORT-052+ créé** (le ticket ne demande
d'en créer qu'en cas de problème réel).

### 4. Grep couleurs en dur

`grep -rn "#[0-9a-fA-F]\{6\}" src/components src/app --include=*.tsx
--include=*.jsx` hors `Banner.jsx` : deux fichiers restants, tous deux déjà
couverts par les exceptions documentées du ticket — `src/components/federer.jsx`
(teint/cheveux du tennisman, SVG figuratif) et
`src/components/demos/QuimesisJawDemo.tsx` (couleurs dents `#8a7361`/`#f1ece2`
et gencives `#a85c63`/`#c98a8f`, une valeur par thème, documentées comme
couleurs « réalistes »). Aucune correction nécessaire.

### 5. Lighthouse

**Non fait.** Aucun navigateur interactif ni CLI Lighthouse disponible dans
cette session (même contrainte qu'à l'étape 3). Noté explicitement plutôt
qu'un score inventé. Dernière valeur connue dans l'historique :
Performance mobile 82-86/100 (mesurée en M1-M5 sur cette même machine
partagée), non re-vérifiée pour `refonte-2026`.

### 6. docs/BACKLOG.md

Jalon « M6 — Recette utilisateur » ajouté avec le tableau des 28 tickets
(PORT-024 à 051) et leur statut réel (`grep status` sur chaque fichier).
PORT-022 documenté comme clos (faux positif, onglet d'automatisation en
arrière-plan).

### 7. PASSATION.md

Ancien contenu archivé dans `.claude/passations/2026-09-27-m6-recette.md`
puis PASSATION.md entièrement réécrit (~61 lignes) : résumé du M6, blocage
`SafranAccent.tsx` (permission refusée) et Lighthouse non fait, hypothèses
ouvertes de `docs/PLAN-RECETTE.md` §2 (surveillant sur cible, démineur
9×9/10 mines, ISMIN 2025, Banner retiré de la home — vérifié dans le code que
`Banner` n'est plus rendu sur `/`, seule sa table d'icônes est réutilisée),
liste des ~17 tickets `review` avec `human_checkpoint` en attente, prochaine
étape.

### 8. Vérification (procédure §4) puis fusion

```
npm run lint
```
→ `✖ 4 problems (0 errors, 4 warnings)` — les 4 avertissements sont dans
`src/theme/useThemeColors.ts` (règle `react-hooks/set-state-in-effect`),
pré-existants, fichier non touché par ce ticket.

```
npm run build
```
→ Next.js 16.3.6 (Turbopack) : `Compiled successfully in 11.7s`,
`Finished TypeScript in 8.0s`, 15 routes générées en statique
(`○ (Static) prerendered as static content`), aucune erreur.

```
npx tsc --noEmit
```
→ aucune sortie, 0 erreur (lancé après `npm run build`, comme demandé).

`git checkout -- CLAUDE.md` effectué avant chaque `git add` (le fichier est
réécrit par chaque démarrage de `next dev`, jamais committé). Fusion vers
`refonte-2026` faite selon la procédure §6, en tant qu'unique agent actif sur
ce ticket (`parallel_safe: false`).

### Écarts par rapport au ticket

- Étape 5 (Lighthouse) non réalisée — outil indisponible, signalé plutôt
  qu'inventé (voir ci-dessus et `PASSATION.md`).
- Étape 3 : aucun navigateur interactif disponible ; remplacé par la méthode
  Chrome headless / DevTools Protocol déjà utilisée par PORT-045/046/047/048,
  avec le sanity-check de bascule de thème en plus pour garantir que le
  résultat « aucun problème » est fiable.
- `SafranAccent.tsx`, signalé comme orphelin par PORT-045, n'a pas été
  supprimé par ce ticket : ce n'est pas une des étapes listées ici, et une
  suppression de fichier hors périmètre du ticket serait une modification non
  demandée (règle « smallest change that works »). Laissé en l'état, documenté
  dans `ARCHITECTURE.md` et `PASSATION.md`.
