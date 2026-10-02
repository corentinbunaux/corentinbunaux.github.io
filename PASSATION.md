# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. Keep it under ~60 lines. Archive older entries under
> `.claude/passations/YYYY-MM-DD-<slug>.md` (done: `2026-09-27-m6-recette.md`,
> `2026-09-28-port-051-m6.md`).

**Session**: 2026-10-02 · **Ticket**: PORT-067 (closes M8) · **Status**: M7 + M8 fermés, `refonte-2026` à jour, build/lint/tsc propres

## What changed

M7 (`recette-utilisateur-2.md`, 10 points, PORT-052 à 062, tous fusionnés) :
panneau du hero (052/placement `inline` dans `DemoEntry`, 053), SncfMiniTrainDemo
2D ajouté + train 3D retiré (055), illustration GCII régénérée (056), cartes
projets avec extrait d'article (057), vraie mâchoire Quimesis en .stl généré
(059, puis couleurs gencive/dent par sommet en suivi direct, `a4f65f0`), deux
vraies démos embarqués balayage+approche / scan+retour en L (060), chevauchement
mobile "À propos" corrigé (061), geste de revers Federer repris du mouvement
réel (062), première passe Safran (054, X-wing agrandi — remplacée ensuite).

M8 (4 points + ajout GCII, PORT-063 à 067, tous fusionnés) : icônes Groot/bRabbit
lisibles en thème clair (063), `--surface-raised` clair moins terne, `#eef2f4`
(064), train SNCF redessiné en profil TGV (065), chasseur Safran passé de
"4 ailes en X" (illisible à 446×250px, même agrandi) à **aile delta inclinée
vers la caméra** + bug de vol à reculons corrigé depuis PORT-054 (066), GCII
reçoit Git/TypeScript/Copilot CLI (icône Simple Icons officielle, `#8534F3`,
067). `ARCHITECTURE.md` mis à jour (2 nouvelles lignes "Key decisions").
`npm run lint && npx tsc --noEmit && npm run build` propres sur `refonte-2026`
HEAD (`a798ac8`).

## What failed

- L'agent PORT-067 a édité les fichiers directement dans le dépôt principal
  au lieu de sa worktree `../wt-PORT-067` (cause non diagnostiquée) avant une
  limite de débit ; l'orchestrateur a vérifié le diff (conforme au ticket) et
  terminé lint/tsc/build/commit lui-même plutôt que de refaire le travail.
- L'agent PORT-066 a été bloqué par le système de permissions en tentant de
  committer la clôture de son propre ticket (`docs(tickets): close PORT-066`
  refusé) ; l'orchestrateur a terminé la clôture, la fusion de `refonte-2026`
  dans la branche, la revérification lint/tsc/build, et la fusion finale.
- Vérification visuelle Chrome headless en échec (timeout d'injection de
  script) pour PORT-065 et PORT-067 — contournée par lecture du HTML/CSS
  rendu + build statique réussi, jamais par une assertion sans preuve.
- Safran "temps 1" (PORT-066) : agrandir/rapprocher/ralentir le même X-wing
  ne suffisait pas — à la taille réelle d'affichage (446×250px) il se lit
  comme une croix/un moulin. Rejeté sur captures plein cadre avant de passer
  au "temps 2" (aile delta). Ne pas retenter cette variante.

## Open questions

- `PORT-054.md` garde un `human_checkpoint` obsolète ("ressemble-t-il à un
  X-wing ?") alors que PORT-066 a remplacé cette silhouette par une aile
  delta — à lire avec PORT-066, pas isolément.
- Terre très sombre dans la démo Safran en rendu headless SwiftShader (un
  seul croissant éclairé) — probablement un artefact du rendu logiciel, non
  vérifié sur un vrai GPU. Si confirmé en vrai, ouvrir un ticket d'éclairage.
- `recette-utilisateur-2.md` (racine, non suivi) est le texte source déjà
  traité de M7 — à archiver ou supprimer une fois Corentin d'accord.

## Human checkpoints en attente (Corentin) — 13 tickets `review` (M7+M8)

052, 054 (lire avec 066), 055, 056, 057, 059, 060, 061, 062, 063, 064, 065,
066. Texte de chaque `human_checkpoint` dans `.claude/tickets/PORT-0XX.md`.
Plus les 32 tickets `review`/jamais-relus hérités de M6 (voir l'archive
`2026-09-28-port-051-m6.md`), toujours non confirmés.

## Do not

Toucher `public/img`/`public/logos` à la main ; repasser ESLint en `^10` ;
committer le `CLAUDE.md` que `next dev` réécrit ; rouvrir le X-wing agrandi
(rejeté, voir "What failed").

## Next step

Recette manuelle de Corentin sur `refonte-2026` pour les 13 `human_checkpoint`
M7+M8 ci-dessus (aucune implémentation en attente). Si retour négatif sur un
point, créer un ticket `fix/PORT-0XX` dédié plutôt que de rouvrir l'ancien.
