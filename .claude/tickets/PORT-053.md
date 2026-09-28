---
id: PORT-053
title: "Registre des démos — placement « demo » (section numérotée) ou « inline » (dans le contexte)"
group: corentin
machine: asus_corentin
milestone: M7 — Recette utilisateur, 2e passe
status: ready
resumeAt: null
priority: P1
estimate: 0.5
confidence: high
model: sonnet
branch: feat/PORT-053-demo-placement
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-28
---

# Fondation — placement des démos

**Procédure** : `docs/PROCEDURE-TICKET.md`. Ce ticket ne change **aucun**
rendu visible : il ajoute juste le mécanisme dont PORT-054 (Safran) et
PORT-055 (SNCF) ont besoin. Ils en dépendent tous les deux et modifient
ensuite chacun leur propre entrée de démo : lis la table de conflits de la
procédure avant de fusionner si un autre ticket est passé entre-temps.

## Pourquoi

Les retours #5 et #6 demandent la même chose sous deux formes : sortir un
visuel de la section « Démo » numérotée pour le glisser dans le contexte de
l'article, sans l'appeler « démo ». Ce ticket ajoute un champ `placement`
au registre pour que `ProjectPage` sache où poser chaque visuel.

## Fichiers

- Modifiés : `src/components/demos/registry.ts`,
  `src/components/demos/DemoSection.tsx`, `src/components/ProjectPage.tsx`

## Étapes

### 1. `registry.ts`

Ajouter deux champs à `DemoEntry` :

```ts
export interface DemoEntry {
  readonly id: DemoId;
  readonly kind: DemoKind;
  readonly ready: boolean;
  readonly Component: ComponentType;
  /** "demo" (section « Démo » numérotée, comportement actuel) ou "inline"
   * (petit visuel posé près du contexte de l'article par ProjectPage, sans
   * titre « Démo » ni numérotation). */
  readonly placement: "demo" | "inline";
  /** Classes Tailwind de taille pour le placement "inline" (ignoré sinon).
   * Sans valeur, InlineVisual applique "mx-auto aspect-square w-full max-w-xs". */
  readonly inlineClassName?: string;
}
```

Puis ajouter `placement: "demo",` à **chacune** des 11 entrées existantes
dans `DEMOS` (une ligne par entrée, juste après `ready: …,`) — ne rien
changer d'autre à ces entrées. Vérifier avec
`grep -c "ready:" src/components/demos/registry.ts` (doit être 11) que le
compte de `placement:` ajouté est identique.

### 2. `DemoSection.tsx`

- Dans `DemoSection`, la ligne `const demos = (DEMOS[href] ?? []).filter((demo) => demo.ready);`
  devient
  `const demos = (DEMOS[href] ?? []).filter((demo) => demo.ready && demo.placement === "demo");`
- Rendre `DemoStage` capable d'une classe de conteneur personnalisée : lui
  ajouter un prop optionnel `className?: string` ; quand fourni, il
  remplace la classe par défaut du conteneur 3D
  (`"relative aspect-video w-full overflow-hidden rounded-2xl border border-second bg-surface"`).
  Le conteneur 2D (`kind === "2d"`) n'a pas besoin de cette option pour ce
  ticket (aucune démo "inline" prévue ici n'est en 2D — si l'un des tickets
  suivants en a besoin, il l'ajoutera lui-même).
- Ajouter un nouvel export, à la fin du fichier :

```tsx
export type InlineVisualProps = { href: string };

/** The small, unlabelled visual PORT-054/PORT-055 place near a project's
 * Context section — no "Démo" heading, no numbering, no figcaption title
 * (only the demo's own caption, smaller, for accessibility). Renders
 * nothing if the project has no "inline"-placement demo, or none is ready. */
export function InlineVisual({ href }: InlineVisualProps) {
  const gate = useDesktopMotionGate();
  const { theme } = useTheme();
  const t = useTranslation();
  const demo = (DEMOS[href] ?? []).find((d) => d.ready && d.placement === "inline");
  if (!demo) return null;

  if (demo.kind === "2d") {
    return (
      <div className="mt-6">
        <demo.Component />
        <p className="mt-2 text-xs text-second-text">{t.demos.items[demo.id].caption}</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className={`relative overflow-hidden rounded-2xl border border-second bg-surface ${demo.inlineClassName ?? "mx-auto aspect-square w-full max-w-xs"}`}>
        {gate === "render" && <demo.Component key={theme} />}
      </div>
      {gate === "render" && (
        <p className="mt-2 text-xs text-second-text">{t.demos.items[demo.id].caption}</p>
      )}
    </div>
  );
}
```

(Adapter le nom exact des imports déjà présents dans le fichier —
`useDesktopMotionGate`, `useTheme`, `useTranslation` sont déjà importés en
tête de `DemoSection.tsx`, ne pas les réimporter en double.)

### 3. `ProjectPage.tsx`

- Ajouter `InlineVisual` à l'import existant :
  `import { DemoSection, InlineVisual } from "./demos/DemoSection";`
- Dans la boucle `{sections.map((section, idx) => { … })}`, le contexte est
  `idx === 0`. Faire retourner un **fragment** contenant la section suivie,
  pour `idx === 0` seulement, du visuel inline :

```tsx
            {sections.map((section, idx) => {
              const headingId = `section-${idx}-heading`;
              return (
                <Fragment key={headingId}>
                  <section aria-labelledby={headingId}>
                    {/* …contenu de la section, inchangé… */}
                  </section>
                  {idx === 0 && <InlineVisual href={project.href} />}
                </Fragment>
              );
            })}
```

  Importer `Fragment` depuis `"react"` en tête de fichier. Déplacer la
  `key` du `<section>` vers le `<Fragment>` (elle ne peut être qu'à un seul
  endroit). Ne rien changer d'autre dans le contenu de la section.

### 4. Vérifications

Procédure §4. Aucun rendu ne doit changer : toutes les démos existantes
gardent `placement: "demo"`, donc `InlineVisual` ne rend jamais rien tant
que PORT-054/055 n'ont pas mis une entrée en `"inline"`. Vérifier par
`curl` (ou headless si disponible) que `/internships/safran` et
`/research/sncf` affichent exactement comme avant (section « Démo »
inchangée, rien de nouveau dans le contexte).

Commit : `feat(demos): add demo/inline placement to the registry`

## Critères d'acceptation

- [ ] `DemoEntry.placement` existe, les 11 entrées existantes l'ont à `"demo"`.
- [ ] `InlineVisual` exporté, rendu `null` tant qu'aucune entrée n'est `"inline"`.
- [ ] Aucun changement visuel sur les pages existantes.
- [ ] lint / tsc / build passent.

## Journal d'exécution

_(à remplir)_

## Notes pour la consolidation

- ARCHITECTURE.md : `DemoEntry` a un champ `placement` ; `InlineVisual`
  (dans `DemoSection.tsx`) pose un visuel sans titre près du Context d'un
  article.
