---
id: PORT-004
title: Nettoyage des tokens CSS et de l'accessibilité globale
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: ready
resumeAt: null
priority: P1
estimate: 2
confidence: high
depends_on: [PORT-002]
parallel_safe: true
human_checkpoint: "Vérifier au clavier (Tab) qu'un focus visible apparaît sur tous les éléments interactifs de la home"
created: 2026-09-26
---

# Nettoyage des tokens CSS et de l'accessibilité globale

**Contexte** — `src/app/app.css` concentre les problèmes relevés dans la
maquette "SITE ACTUEL" (`design/mockups/01-site-actuel.png`, panneau « Limites à
corriger ») : contraste sous le seuil WCAG AA, hauteurs de section en `vh` par
breakpoint, `text-align: justify`, `user-select: none` sur `body`, scrollbar
masquée. Alimente le critère de cadrage « Lighthouse Accessibility = 100 » et
« zéro échec de contraste WCAG AA » (`docs/CADRAGE.md`, critères 1 et 3).

**Livrable** — `src/app/app.css` expose un jeu de tokens de surface, de bordure
et de focus conforme à la maquette « REFONTE », sans aucun texte sous le seuil
WCAG AA, sans hauteur de section en `vh` fixe, sans `justify`, sans
`user-select: none` et avec la barre de défilement rendue visible.

## Constat d'investigation (lu dans le code avant rédaction)

Trois points contredisent ou complètent la rédaction initiale :

1. **`#home` ne peut pas passer en padding pur.** Les enfants de
   `homepage.jsx` sont en `absolute h-full w-full` et résolvent leur hauteur
   contre le bloc conteneur initial. Supprimer `height: 100vh` sur `#home`
   effondre le hero à zéro. Le hero doit garder une hauteur *minimale* de
   viewport (`min-height: 100svh`), ce qui supprime la casse hors 16:9 (le
   contenu peut déborder vers le bas) sans casser le hero.
2. **`#8f8f8f` ne passe pas AA sur toutes les surfaces demandées.** Ratios
   calculés : 5.38:1 sur `#1a1a1a`, 5.04:1 sur `#202020`, **4.44:1 sur
   `#2a2a2a`** — sous le seuil de 4.5:1. La valeur retenue est donc `#999999`
   (6.11 / 5.72 / 5.03), qui respecte bien la consigne « ≥ #8f8f8f ».
3. **Deux défauts non listés dans le ticket initial :**
   - `.btn_federer` affiche `--main-text` (#f5f5f5) sur `--my-green` (#81a3a7) =
     **2.49:1**, échec AA sur un bouton de la home.
   - `border-second` (`projectsSection.jsx:325`) est une classe Tailwind non
     définie : les cartes portent aujourd'hui le gris clair par défaut de
     Tailwind. Définir le token la fait enfin pointer sur la bordure voulue.

**Acceptance criteria**
- [ ] `--second-text` remonté à `#999999` (≥ `#8f8f8f`), ratio ≥ 4.5:1 vérifié
      par calcul sur `--main`, `--surface` et `--surface-raised`.
- [ ] Nouveaux tokens `--surface: #202020`, `--surface-raised: #2a2a2a`,
      `--border: #2f2f2f` définis dans `:root`.
- [ ] Un token de focus (`--focus`) et une règle `:focus-visible` globale
      donnent un contour visible ≥ 3:1 sur toutes les surfaces.
- [ ] `text-align: justify` supprimé de `h3`/`p`, remplacé par `left`.
- [ ] Plus aucune déclaration `height: <n>vh` sur `#home`, `#profile`,
      `#about`, `#portfolio` ; l'espacement vient d'un token de padding.
- [ ] `user-select: none` retiré de `body` ; `scrollbar-width: none` et
      `::-webkit-scrollbar { width: 0 }` retirés, barre de défilement visible.
- [ ] `.btn_federer` passe AA (texte `--main` sur `--my-green` = 6.41:1).
- [ ] `npm run lint` et `npx tsc --noEmit` propres, `npm run build` réussit.
- [ ] La home ne produit aucun scroll horizontal à 360px de large.

**Files**
- `src/app/app.css` — le gros du travail.
- `tailwind.config.js` — exposer les tokens de couleur à Tailwind (notamment
  `second` pour `border-second`).
- Ne pas toucher : `src/components/homepage.jsx` et
  `src/components/projectsSection.jsx` (PORT-005 y travaille en parallèle),
  `src/components/navbar.jsx` (PORT-006), `PASSATION.md`, `ARCHITECTURE.md`
  (conflits de merge avec trois sessions parallèles), et le bloc
  `@keyframes ball_path` (~600 lignes, conservé par arbitrage explicite).

**Approach**
1. Réécrire le bloc `:root` : surfaces, bordure, focus, `--second-text`, plus
   un token d'espacement vertical de section.
2. Supprimer le masquage de la scrollbar et `user-select: none`, passer les
   titres et paragraphes au fer à gauche.
3. Remplacer les blocs de hauteurs en `vh` breakpoint par breakpoint : padding
   vertical pour `#profile`, `#portfolio`, `#about` ; `min-height: 100svh` pour
   `#home` seulement.
4. Neutraliser les hauteurs en pourcentage devenues orphelines (`h-full`,
   `h-5/6`, `h-2/3`) côté CSS, sans toucher au JSX.
5. Ajouter la règle `:focus-visible` et corriger le contraste de
   `.btn_federer`.
6. Vérifier chaque section au navigateur à 360px et en desktop.

**Test plan** — Aucune suite de tests n'existe et aucune n'est demandée
(`docs/CADRAGE.md`, tableau des non-objectifs). La vérification est :
`npm run lint`, `npx tsc --noEmit`, `npm run build`, puis inspection au
navigateur via `npm run dev` à 360px et à 1440px, section par section. Les
ratios de contraste sont vérifiés par calcul de luminance relative WCAG, pas
par estimation visuelle.

**Out of scope**
- L'accessibilité de `navbar.jsx` (rôles, `aria-current`, cible clavier) —
  c'est PORT-006, qui dépend du token de focus défini ici.
- Le passage à `next/image` et la refonte des cartes projet — PORT-005.
- La nouvelle échelle typographique et la police géométrique chargée
  localement — ticket séparé.
- Toute restructuration de composant : ce ticket est design-system seulement.
- La suppression du bloc `ball_path`.

**Human checkpoint** — Lancer `npm run dev`, aller sur la home, parcourir la
page uniquement au clavier avec Tab : un contour visible doit apparaître sur
chaque lien de la navbar, sur les liens sociaux, sur les cartes projet
cliquables et sur le bouton PUSH. Vérifier au passage que la sélection de texte
à la souris fonctionne et que la barre de défilement est visible.

**Risks**
- Le remplacement des `vh` est la partie risquée : les quatre sections ont des
  enfants en hauteur relative (`h-full`, `h-5/6`, `h-1/2`, `h-2/3`) qui
  s'effondrent dès que le parent n'a plus de hauteur définie. Chaque section
  doit être regardée au navigateur, pas seulement dans le diff.
- `page.tsx` mesure `offsetTop` des quatre sections pour la navigation smooth
  de la navbar : si une section s'effondre, la navigation par ancre devient
  fausse. À contrôler après le changement de hauteurs.
- Les cartes projet, privées de la hauteur imposée par `#portfolio`, se
  réduisent à la hauteur de leur texte. Une hauteur minimale de carte est
  nécessaire.
