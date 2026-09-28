# Handover

> Written at the end of each session by `/passation`, read at the start of the
> next by `/reprise`. Keep it under ~60 lines. Archive older entries under
> `.claude/passations/YYYY-MM-DD-<slug>.md` (done: `2026-09-27-m6-recette.md`).

**Session**: 2026-09-28 · **Ticket**: PORT-051 · **Status**: M6 (recette utilisateur) fermé, `refonte-2026` à jour

## What changed

M6 traite les 16 retours de la recette du 2026-09-26 (`docs/PLAN-RECETTE.md`) :
thème clair/sombre + `lucide-react` (026), `SiteHeader` unique (028), hero
façon maquette + Profil fusionné, plus de `#profile` (037/044), Parcours à
deux pistes (030/050), articles Markdown (036), GCII illustré (032), 10
démos 2D/3D (038-042, 045-049), tennisman animé (043). PORT-024 à 050
**tous** fusionnés dans `refonte-2026` (`git log --oneline`). ARCHITECTURE.md
réécrit. Contrôle croisé thème clair/sombre × 1280/360 px sur 13 pages via
Chrome headless (DevTools Protocol) : zéro contraste/débordement/console
cassé. Aucune couleur en dur restante hors les deux exceptions documentées
(`federer.jsx`, `QuimesisJawDemo.tsx`).

## What failed / is blocked

- `src/components/SafranAccent.tsx` reste présent : mort depuis PORT-045
  (plus importé nulle part) mais `git rm` **refusé deux fois** par le
  classifieur de permissions du mode auto (« Irreversible Local
  Destruction »), y compris en session reprise ; pas de contournement
  tenté. À supprimer manuellement (Corentin, ou une session future avec
  cette permission).
- Lighthouse non lancé (étape 6) : aucun navigateur/CLI Lighthouse
  disponible. Dernière valeur connue : 82-86/100 Performance mobile
  (mesurée en M1-M5, pas re-vérifiée sur l'état `refonte-2026` actuel).

## Open questions — hypothèses non bloquantes de PLAN-RECETTE.md §2

À confirmer par Corentin : un surveillant peut occuper une case cible mais
pas un mur ; démineur 9×9/10 mines ; diplôme ISMIN présenté comme obtenu en
2025 ; le bandeau technos `Banner` quitte la home (vérifié en code : plus
rendu, seules ses icônes sont réutilisées).

## Human checkpoints en attente (Corentin) — 32 tickets `review`

M6 (17) : 026, 028, 029, 030, 032, 035, 036, 037, 038, 039, 040, 042, 043,
044, 045, 048, 049 — plus **PORT-051 lui-même** (« nouvelle recette complète
sur `refonte-2026` »). Antérieurs à M6, jamais relus (15, reportés des
PASSATION précédentes) : 001, 002, 004-010, 013, 015, 016, 019-021. Texte de
chaque `human_checkpoint` dans `.claude/tickets/PORT-0XX.md`. PORT-022 clos
(faux positif). PORT-011/017/018 : `human_checkpoint` non nul mais déjà
`status: done` (validés avant M6 ?) — à confirmer, pas rouvert ici.

## Do not

Toucher `public/img/Avatar_Coco.png` ou `public/img`/`public/logos` à la
main ; repasser ESLint en `^10` ; committer le `CLAUDE.md` que `next dev` réécrit.

## Next step

Recette manuelle de Corentin sur `refonte-2026` (tous les `human_checkpoint`
ci-dessus), puis suppression de `SafranAccent.tsx`, puis un Lighthouse réel
quand un navigateur est disponible.
