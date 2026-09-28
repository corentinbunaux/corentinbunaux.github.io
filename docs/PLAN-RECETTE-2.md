# Plan d'implémentation — 2ᵉ passe de recette (`recette-utilisateur-2.md`)

Source : `recette-utilisateur-2.md` (11 retours de Corentin sur le rendu de
la recette M6). Tickets : `.claude/tickets/PORT-052` à `PORT-062`.
Procédure d'exécution commune : `docs/PROCEDURE-TICKET.md` ; règles des
scènes 3D : `docs/GUIDE-3D.md`. Branche cible : `refonte-2026`.

## 1. Ce qui a été vérifié avant d'écrire les tickets

- **Palette Enedis** (point 3) : les couleurs proposées en M6 étaient
  inventées. Le 2026-09-28, j'ai lu le CSS compilé réellement servi par
  `enedis.fr` (variables `--btn-bg-color`, `--color`, `--gauge-*`) : bleu
  primaire `#1423dc`, marine `#232873`/`#2e3176`, teintes claires
  `#e8e9fc`/`#d0d3f8`/`#f6f6fe`, accent turquoise `#4bc3c3`, accent violet
  `#5b65e6`. Ce sont ces valeurs, et uniquement celles-ci, qui vont dans le
  nouveau visuel GCII.
- **Contour de la France** (point 3) : téléchargé et fusionné les 12 régions
  métropolitaines (hors Corse) depuis `gregoiredavid/france-geojson`
  (Etalab Licence Ouverte, dérivé de l'IGN), simplifié et projeté en un
  polygone de 427 points + 4 îles (Belle-Île, Ré, Oléron, Noirmoutier).
  Rendu et vérifié visuellement (capture jointe au ticket PORT-056) : la
  forme est immédiatement reconnaissable.
- **Bug du vaisseau Safran** (point 5) : lu le code de `SafranEarthDemo.tsx`.
  Le bug est identifié précisément : le `BoxGeometry` de chaque aile a sa
  plus grande dimension sur le même axe que le fuselage (l'avant), pas
  perpendiculaire à lui — les 4 ailes sont donc 4 tiges fines plaquées
  contre le fuselage, jamais déployées vers l'extérieur. C'est pour ça que
  ça ne ressemble à rien. Diagnostic transmis au ticket PORT-054.
- **Fichier `.stl` de la mâchoire Quimesis** (point 8) : recherché dans tout
  l'historique Git du dépôt et sur le poste (`find`, tous formats 3D usuels)
  — introuvable. Voir la question posée à la fin de ce message : ticket
  PORT-059 non détaillé/non lancé tant que Corentin n'a pas répondu.
- **Couleurs classiques du démineur** (point 7) : la palette convention
  (1 bleu, 2 vert, 3 rouge, 4 marine, 5 marron, 6 cyan, 7 noir, 8 gris) a
  été vérifiée au contraste WCAG contre `--surface` clair **et** sombre —
  toutes les valeurs choisies passent ≥ 5:1 dans les deux thèmes.

## 2. Un défaut structurel commun à 3 retours (points 4, 5, 6)

Les points 5 et 6 demandent la même chose sous deux formes : sortir un
visuel de la section « Démo » numérotée pour le mettre dans le contexte de
l'article, sans lui donner ce nom. Plutôt que bricoler deux fois, PORT-053
ajoute un champ `placement: "demo" | "inline"` au registre des démos ; les
tickets Safran (054) et SNCF (055) en dépendent tous les deux mais ne
touchent pas les mêmes fichiers de démo, donc ils peuvent tourner en
parallèle une fois 053 fusionné.

Le point 4 (carte Safran trop haute) est indépendant de ça : c'est un effet
de bord de la grille CSS (la carte vedette GCII fait 2 colonnes de large,
donc 2× plus haute en `aspect-video` ; sa voisine de ligne — Safran — est
étirée à la même hauteur par `align-items: stretch`, ce qui laisse du vide
sous son texte). Le corrigé : afficher le début de l'article (déjà écrit
dans `content/projects/`) à la place du vide, sur **toutes** les cartes,
pas seulement Safran.

## 3. Vagues d'exécution

```
Vague 1 — indépendants (6 en parallèle)
  052 orbite du hero      053 fondation "inline"      056 carte GCII v2
  057 carte projet + extrait   058 démineur stylé      061 à-propos (diagnostic + textes)

Vague 2 — dépendent de 053 (3 en parallèle, dès 053 fusionné)
  054 vaisseau Safran + placement inline
  055 train SNCF : retrait 3D, ajout 2D inline
  060 systèmes embarqués : les deux vraies démos

Vague 3 — dépend de 061 (même fichiers)
  062 tennisman : revers une main à la Federer

Hors vague — bloqué
  059 mâchoire Quimesis réelle (.stl) : question posée à Corentin, non lancé
```

## 4. Tableau des tickets

| Ticket | Titre | Modèle | Dépend de |
| --- | --- | --- | --- |
| PORT-052 | Hero : icônes en orbite autour de l'avatar (plus d'astre), couleur des icônes en thème clair | sonnet | — |
| PORT-053 | Registre des démos : placement `"demo"` / `"inline"` | sonnet | — |
| PORT-054 | Safran : vaisseau redessiné, visuel déplacé dans le contexte | sonnet | 053 |
| PORT-055 | SNCF : retrait du train 3D, petit train 2D dans le contexte | haiku | 053 |
| PORT-056 | GCII : carte de France réelle + palette Enedis officielle | haiku | — |
| PORT-057 | Cartes projet : extrait de l'article au lieu du vide | sonnet | — |
| PORT-058 | Démineur : habillage visuel façon classique | haiku | — |
| PORT-060 | Systèmes embarqués : les deux vraies démos (balayage+approche, scan+retour en L) | sonnet | 053 |
| PORT-061 | À propos : chevauchement mobile, libellés, catégories | sonnet | — |
| PORT-062 | Tennisman : revers une main, tout le corps | opus | 061 |
| PORT-059 | Quimesis : mâchoire réelle (.stl) | à définir | question posée |
