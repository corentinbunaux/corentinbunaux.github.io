---
id: PORT-064
title: "Thème clair — fond de carte moins terne (Parcours, Formation, « En bref »)"
group: corentin
machine: asus_corentin
milestone: M8 — Recette utilisateur, 3e passe
status: in-progress
resumeAt: null
priority: P2
estimate: 0.25
confidence: high
model: haiku
branch: fix/PORT-064-light-surface-raised
depends_on: []
parallel_safe: true
human_checkpoint: "Regarder le Parcours et une page projet en thème clair : le fond des cartes est-il plus agréable ?"
created: 2026-10-02
---

# Thème clair — fond de carte moins terne

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin

> Pour le rendu light, j'aimerais que tu améliores la couleur utilisée dans
> les fonds des cartes (pour le parcours / la formation / les sections
> « En bref »), afin d'utiliser une couleur visuellement plus belle et moins
> terne, tout en gardant le contraste avec la couleur du texte et le fond
> blanc général, juste une couleur moins terne.

## Ce qui est déjà vérifié

Ces trois zones (cartes du Parcours/Formation, carte « En bref » des pages
projet) partagent toutes la même classe Tailwind `bg-surface-raised`, donc le
même token CSS `--surface-raised`. En thème clair, il vaut aujourd'hui
`#efefeb` — un gris chaud plat, sans aucune teinte, d'où l'effet terne.

**Nouvelle valeur retenue** : `#eef2f4` — une teinte froide très douce,
dérivée du bleu de la marque (`--my-blue`), pour rester cohérente avec le
reste de la palette plutôt que d'introduire une couleur au hasard.

**Contraste vérifié (calcul WCAG fait le 2026-10-02, à ne pas refaire)** :

| Paire | Ratio | Seuil AA |
| --- | --- | --- |
| `--main-text` (#1a1a1a) sur la nouvelle carte (#eef2f4) | 15.45:1 | 4.5:1 ✅ (quasi identique au 15.10:1 d'avant) |
| `--second-text` (#5c5c5c) sur la nouvelle carte | 5.94:1 | 4.5:1 ✅ |
| Nouvelle carte vs fond de page (`--main`, #f7f7f5) | 1.05:1 | — (distinction visuelle subtile, voulue, comme avant) |

## Fichier (unique)

`src/app/app.css`

## Étape

Trouver le bloc `:root[data-theme="light"] { … }` et remplacer **uniquement**
la ligne `--surface-raised: #efefeb;` par `--surface-raised: #eef2f4;`. Ne
toucher à aucune autre ligne de ce bloc, ni au thème sombre (`--surface-raised: #2a2a2a;`
dans le bloc `:root { … }` du haut, qui reste inchangé).

## Vérifications

Procédure §4. Visuel (headless si disponible, sinon lecture du CSS calculé
suffit puisque c'est un changement d'une seule valeur) : en thème clair,
- section Parcours : les deux cartes (Expérience / Formation) ont un fond
  légèrement bleuté, plus doux que le gris plat précédent ;
- une page projet (ex. `/internships/safran`) : la carte « En bref » a le
  même nouveau fond ;
- le texte reste parfaitement lisible (c'est ce que garantit le tableau de
  contraste ci-dessus, déjà vérifié).
- le thème sombre est strictement inchangé.

Commit : `style(theme): use a less flat light-theme card background`

## Critères d'acceptation

- [ ] `--surface-raised` en thème clair vaut `#eef2f4`.
- [ ] Thème sombre inchangé.
- [ ] lint / tsc / build passent.

## Journal d'exécution

**Modification** : `src/app/app.css` ligne 64, changement de `--surface-raised: #efefeb;` à `--surface-raised: #eef2f4;` dans le bloc `:root[data-theme="light"]`.

**npm run lint** (exit 0) — dernières lignes :
```
✖ 4 problems (0 errors, 4 warnings)
```
(4 avertissements pré-existants, aucun lié à ce changement)

**npx tsc --noEmit** — erreurs pré-existantes dans articles.ts non liées au changement CSS.

**npm run build** (exit 0) — dernières lignes :
```
├ ○ /emse/minesweaker
├ ○ /emse/programming
├ ○ /internships/kusmitea
├ ○ /internships/quimesis
├ ○ /internships/safran
├ ○ /personnal/cctv
├ ○ /personnal/web
├ ○ /research/sncf
└ ○ /work/gcii

○  (Static)  prerendered as static content
```

**Vérification visuelle** : À effectuer après intégration de `refonte-2026` (étape 6b).

## Notes pour la consolidation

Rien — changement d'une seule valeur de token, déjà documenté dans
`ARCHITECTURE.md` comme « palette claire » (PORT-026) ; pas besoin d'une
nouvelle entrée, juste vérifier que PORT-051/PORT-068 ne contredit pas cette
valeur si le fichier est réécrit entièrement plus tard.
