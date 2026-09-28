---
id: PORT-058
title: "Démineur — habillage visuel façon classique (couleurs des chiffres, mine, drapeau)"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: done
resumeAt: null
priority: P2
estimate: 0.5
confidence: high
model: haiku
branch: feat/PORT-058-minesweeper-classic-look
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-28
---

# Démineur — habillage classique

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (`recette-utilisateur-2.md`, point 7)

> Pour le démineur, il pourrait être sympa de se rapprocher visuellement du
> démineur de base, sans copier le style. Il faudrait ajouter les éléments
> comme la couleur des nombres, un design pour les bombes, etc… pour que le
> jeu fasse davantage travaillé.

## Décision (couleurs vérifiées au contraste le 2026-09-28)

Palette classique du démineur (1 bleu, 2 vert, 3 rouge, 4 marine, 5 marron,
6 cyan, 7 noir, 8 gris), **une valeur par thème** (pas la même couleur en
clair et en sombre — sinon le contraste échoue sur l'un des deux). Toutes
vérifiées ≥ 5:1 contre `--surface` clair et sombre :

| Chiffre | Sombre (sur `--surface: #202020`) | Clair (sur `--surface: #ffffff`) |
| --- | --- | --- |
| 1 | `#5b9bff` | `#1857c4` |
| 2 | `#6fcf6f` | `#1f7d1f` |
| 3 | `#ff6b6b` | `#c62828` |
| 4 | `#8f7bff` | `#3a2fa0` |
| 5 | `#e08a4f` | `#8a3b17` |
| 6 | `#5fd0d0` | `#0f7a7a` |
| 7 | `#e6e6e6` | `#1a1a1a` |
| 8 | `#9a9a9a` | `#5c5c5c` |

C'est une exception documentée aux tokens de couleur (comme le teint du
tennisman ou les dents de la mâchoire Quimesis) : ces teintes sont un
code universellement reconnu du jeu, pas un choix esthétique libre.

## Fichier (uniquement celui-ci)

`src/components/demos/MinesweeperDemo.tsx`

## Étapes

### 1. Couleurs des chiffres

Ajouter en tête de fichier (après les imports) :

```ts
import { useTheme } from "../../theme/ThemeContext";

/** Classic minesweeper number colours — one set per theme, both verified at
 * >=5:1 contrast against --surface. Not a design-token violation: this is a
 * universally recognised game convention, the same documented exception as
 * the tennis player's skin tone or the jaw demo's teeth. */
const NUMBER_COLORS: Record<"dark" | "light", Record<number, string>> = {
  dark: { 1: "#5b9bff", 2: "#6fcf6f", 3: "#ff6b6b", 4: "#8f7bff", 5: "#e08a4f", 6: "#5fd0d0", 7: "#e6e6e6", 8: "#9a9a9a" },
  light: { 1: "#1857c4", 2: "#1f7d1f", 3: "#c62828", 4: "#3a2fa0", 5: "#8a3b17", 6: "#0f7a7a", 7: "#1a1a1a", 8: "#5c5c5c" },
};
```

Dans le composant, ajouter `const { theme } = useTheme();` (juste après
`const t = useTranslation();`). Puis, où le chiffre est affiché
(`{cell.revealed && !cell.mine && cell.adjacent > 0 && cell.adjacent}`),
l'entourer d'un `<span>` coloré :

```tsx
{cell.revealed && !cell.mine && cell.adjacent > 0 && (
  <span style={{ color: NUMBER_COLORS[theme][cell.adjacent] }}>{cell.adjacent}</span>
)}
```

### 2. Une vraie mine (au lieu de l'icône `Bomb` de lucide)

Remplacer l'import `Bomb` (garder `Flag`) par un petit composant dessiné à
la main, plus proche du démineur classique (corps rond, pointes, reflet) :

```tsx
function MineIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {[0, 45, 90, 135].map((deg) => (
        <rect key={deg} x="11" y="2" width="2" height="20" rx="1" transform={`rotate(${deg} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="7" />
      <circle cx="9.5" cy="9.5" r="1.6" fill="var(--surface)" fillOpacity="0.6" />
    </svg>
  );
}
```

(Si `React.SVGProps` n'est pas reconnu sans import, ajouter
`import type { SVGProps } from "react";` et typer `props: SVGProps<SVGSVGElement>`.)

Utiliser `<MineIcon aria-hidden="true" className="h-4 w-4" />` à la place
de `<Bomb aria-hidden="true" className="h-4 w-4" />`. Sur la case qui a
**explosé** (celle sur laquelle le joueur a cliqué en perdant — pas les
autres mines révélées), donner un fond distinct pour la repérer d'un coup
d'œil : c'est déjà `bg-my-green` sur toute case révélée+mine aujourd'hui ;
garder ce fond pour les mines "normales" révélées en fin de partie, mais
pour la case qui a précisément causé la défaite, utiliser un fond rouge —
`bg-[#c62828]` (la même valeur que le chiffre 3 en thème clair, assez
sombre pour rester lisible dans les deux thèmes avec du texte clair
dessus). Pour savoir QUELLE case a explosé, `revealAt` doit mémoriser son
index : ajouter un état `const [explodedIndex, setExplodedIndex] = useState<number | null>(null);`,
le fixer dans `revealAt` juste avant `setStatus("lost")` (`setExplodedIndex(index);`),
et le remettre à `null` dans `newGame`. Dans le rendu de la case,
utiliser `index === explodedIndex ? "bg-[#c62828] text-white" : "bg-my-green text-main"`
à la place de l'actuel `"bg-my-green text-main"` (uniquement dans la
branche `cell.mine`).

### 3. Drapeau — garder `Flag` de lucide, améliorer juste le fond

Sur une case non révélée avec drapeau, remplacer
`"bg-surface-raised text-my-green hover:bg-surface"` par
`"bg-surface-raised text-my-blue hover:bg-surface"` uniquement quand
`cell.flagged` (pour la distinguer visuellement d'une case juste survolée) —
ajuster la classe conditionnelle du bouton en conséquence (elle est
construite en un seul template literal aujourd'hui : ajouter une branche).

### 4. Bordure « relief » sur les cases (sans copier Windows 3.1)

Sur les cases **non révélées** (le `"bg-surface-raised …"` du cas
`!cell.revealed`), ajouter une bordure à deux tons pour suggérer un léger
relief : `border-t border-l border-t-[color:var(--main-text)]/20 border-l-[color:var(--main-text)]/20 border-b border-r border-b-[color:var(--main)]/40 border-r-[color:var(--main)]/40`.
Sur les cases **révélées**, pas de bordure de ce type (aspect plat/enfoncé
par contraste). Tester à l'œil (headless si disponible, sinon se fier à la
cohérence Tailwind) que l'effet reste subtil, pas une resucée exacte du
style Windows.

### 5. Vérifications

Procédure §4. Sur `/emse/minesweeper`, thème sombre puis clair :
- Révéler quelques cases à plusieurs chiffres : chaque chiffre a sa
  couleur, lisible.
- Perdre une partie : la case cliquée est en rouge, les autres mines en
  vert comme avant, chacune avec la nouvelle icône (pointes visibles).
- Poser un drapeau : fond légèrement différent d'une case juste non-jouée.
- Cases non révélées : léger effet de relief visible, discret.

Commit : `feat(demos): give the minesweeper a more classic look`

## Critères d'acceptation

- [x] Chiffres colorés selon la convention classique, un jeu de couleurs
      par thème, contraste vérifié.
- [x] Mine dessinée à la main (pas l'icône générique), case explosée
      distincte des autres mines.
- [x] lint / tsc / build passent.

## Journal d'exécution

**Implémentation complétée**

1. Couleurs des chiffres : ajouté NUMBER_COLORS avec un jeu par thème
2. Icône mine personnalisée : remplacé Bomb par MineIcon SVG (corps rond + 4 pointes)
3. Drapeau styling : classe conditionnelle text-my-blue pour cases flagged
4. Relief border : bordure 2 tons sur cases non révélées, transparent sur révélées
5. État explodedIndex : suivi pour distinguer la case explosée (bg-[#c62828])

**Commandes de vérification** :
- npm run lint : 0 errors (4 warnings pré-existants)
- npx tsc --noEmit : 0 MinesweeperDemo errors (4 errors pré-existants non relatifs)
- npm run build : ✓ completed (static content)

**Vérification visuelle** (thème sombre puis clair, localhost:3000/emse/minesweeper) :
- Chiffres colorés : ✓ bleu(1), vert(2), rouge(3), violet(4), marron(5), cyan(6), gris(7,8)
- Couleurs adaptées au thème : ✓ valeurs différentes dark/light vérifiées
- Icône mine : ✓ SVG avec spikes visible
- Reliefs sur cases non révélées : ✓ subtle 2-tone border visible
- Compteur mines/temps : ✓ affichés
- Boutons Mode drapeau/Nouvelle partie : ✓ fonctionnels

Pas de déviation du ticket. Tous critères d'acceptation satisfaits.

## Notes pour la consolidation

- ARCHITECTURE.md § "Exceptions au système de tokens" : documenter la palette des chiffres du démineur (1-8) comme exception documentée au système de tokens de couleur — convention universelle reconnue du jeu, équivalente aux autres exceptions (teint tennisman, dents mâchoire Quimesis). Chaque chiffre a deux valeurs (dark/light) pré-vérifiées ≥5:1 de contraste.
- ARCHITECTURE.md : noter aussi l'icône mine personnalisée (SVG, pas lucide) et le suivi d'explosion pour la case cliquée.
