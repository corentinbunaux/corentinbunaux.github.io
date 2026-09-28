---
id: PORT-055
title: "SNCF — retirer le train 3D, ajouter un petit train 2D dans le contexte"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: ready
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-055-sncf-2d-train
depends_on: [PORT-053]
parallel_safe: true
human_checkpoint: null
created: 2026-09-28
---

# SNCF — retrait du train 3D, petit train 2D

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (`recette-utilisateur-2.md`, point 6)

> Pour l'article de la SNCF, il faut retirer la démo avec le train en 3D,
> je ne veux pas de ceci. Il faut conserver le graphique espace-temps.
> Cependant, j'aimerais tout de même avoir une petite animation avec un
> train (en 2D) dans l'article, à une position qui te convient le mieux,
> cela peut être dans le contexte, dans le titre, sous le résumé, histoire
> d'avoir un visuel supplémentaire qui soit un peu fun.

Position choisie : dans le contexte de l'article, via le mécanisme
`placement: "inline"` de PORT-053 (dont ce ticket dépend).

## Fichiers

- Créé : `src/components/demos/SncfMiniTrainDemo.tsx`
- Supprimés : `src/components/demos/SncfTrainDemo.tsx`
- Modifiés : `src/components/demos/registry.ts` (bloc `research/sncf`),
  `src/components/demos/demoIds.ts` (remplacer `"sncf-train"` par
  `"sncf-mini-train"`), `src/i18n/namespaces/demos.ts` (renommer/réécrire
  les 2 légendes correspondantes)

## Étapes

### 1. Retirer le train 3D

- `git rm src/components/demos/SncfTrainDemo.tsx`. Si la commande est
  refusée par une règle de permission : laisser le fichier, mettre
  `ready: false` sur son entrée à la place (étape 2), et le signaler
  explicitement dans le journal — ne pas insister.
- Dans `src/components/demos/registry.ts` : supprimer entièrement le bloc
  `dynamic(() => import("./SncfTrainDemo")…)` en tête de fichier, et
  l'entrée `id: "sncf-train"` du tableau `DEMOS["research/sncf"]`.

### 2. Le petit train 2D — `src/components/demos/SncfMiniTrainDemo.tsx`

Une bande décorative fine, en pur CSS/SVG (pas de three.js — c'est un
"kind: 2d", ça marche partout, pas de gate desktop). Un train stylisé qui
roule de gauche à droite sur une voie, en boucle, lentement.

```tsx
"use client";

/**
 * A thin decorative strip: a stylised train looping left to right on a
 * track. Pure CSS animation, no three.js — this is "kind: 2d" so it runs
 * everywhere, including mobile and prefers-reduced-motion (where the CSS
 * animation is disabled below, leaving the train parked).
 */
export function SncfMiniTrainDemo() {
  return (
    <div className="relative h-16 w-full overflow-hidden">
      <div className="absolute inset-x-0 bottom-3 h-0.5 bg-second" aria-hidden="true" />
      <div
        className="sncf-mini-train absolute bottom-3 flex -translate-y-1/2 items-end gap-0.5"
        aria-hidden="true"
      >
        <svg viewBox="0 0 64 24" className="h-8 w-20 text-my-green" fill="currentColor">
          <rect x="0" y="6" width="40" height="14" rx="3" />
          <rect x="34" y="0" width="14" height="10" rx="2" />
          <circle cx="10" cy="21" r="3" className="fill-main-text" />
          <circle cx="30" cy="21" r="3" className="fill-main-text" />
        </svg>
        <svg viewBox="0 0 40 24" className="h-7 w-14 text-my-blue" fill="currentColor">
          <rect x="0" y="8" width="40" height="12" rx="2" />
          <rect x="4" y="10" width="8" height="6" className="fill-surface" />
          <rect x="16" y="10" width="8" height="6" className="fill-surface" />
          <rect x="28" y="10" width="8" height="6" className="fill-surface" />
          <circle cx="8" cy="20" r="2.5" className="fill-main-text" />
          <circle cx="32" cy="20" r="2.5" className="fill-main-text" />
        </svg>
      </div>
    </div>
  );
}
```

Ajouter dans `src/app/app.css`, à la fin du fichier :

```css
/* PORT-055: the SNCF mini-train strip loops left to right, off-screen to
   off-screen, so it never appears to "teleport" mid-frame. */
@keyframes sncf_mini_train {
  from { left: -6rem; }
  to { left: 100%; }
}
.sncf-mini-train {
  animation: sncf_mini_train 14s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .sncf-mini-train {
    animation: none;
    left: 40%;
  }
}
```

### 3. `demoIds.ts`

Remplacer `"sncf-train"` par `"sncf-mini-train"` dans l'union `DemoId`.

### 4. `registry.ts`

Ajouter, dans le tableau `DEMOS["research/sncf"]` (à la place de l'entrée
retirée à l'étape 1) :

```ts
const SncfMiniTrainDemo = dynamic(() => import("./SncfMiniTrainDemo").then((m) => m.SncfMiniTrainDemo), { ssr: false });
```
(en tête de fichier, avec les autres `dynamic(...)`), puis dans le tableau :
```ts
    {
      id: "sncf-mini-train",
      kind: "2d",
      ready: true,
      placement: "inline",
      Component: SncfMiniTrainDemo,
    },
```

### 5. Légendes — `src/i18n/namespaces/demos.ts`

Renommer la clé `"sncf-train"` en `"sncf-mini-train"` (FR et EN) et
réécrire son contenu :

FR :
```
title: "Sur les rails",
caption: "Un petit clin d'œil animé : c'est ce genre de circulation que les graphiques espace-temps ci-dessous représentent.",
```

EN :
```
title: "On the rails",
caption: "A small animated wink: this is the kind of movement the space-time diagram below represents.",
```

### 6. Vérifications

Procédure §4. Sur `/research/sncf` : la bande du train apparaît juste après
le paragraphe de contexte (pas de titre « Démo », pas de numéro) ; le train
roule en boucle de gauche à droite ; à 360 px il reste visible et roule
aussi (c'est du 2D, pas de gate desktop) ; avec « réduire les animations »
émulé, le train est immobile ; la section « Démo » plus bas ne contient
plus que le graphique espace-temps.

Commit : `feat(sncf): drop the 3D train, add a small 2D train in the context`

## Critères d'acceptation

- [ ] Plus de train 3D nulle part sur la page.
- [ ] Petit train 2D visible dans le contexte, partout (pas desktop-only).
- [ ] Le graphique espace-temps reste dans la section « Démo ».
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : `SncfTrainDemo.tsx` (3D) remplacé par
  `SncfMiniTrainDemo.tsx` (2D, CSS pur, placement `"inline"`).
