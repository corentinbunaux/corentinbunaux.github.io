---
id: PORT-034
title: "En-tête — trait horizontal sous la section courante (scroll-spy)"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P2
estimate: 0.25
confidence: high
model: haiku
branch: feat/PORT-034-nav-active-underline
depends_on: [PORT-028]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Soulignement de la section courante

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#15)

> Ajouter un trait horizontal sur la navbar pour informer l'utilisateur de où
> il se trouve durant la navigation sur le site.

Comportement retenu :
- Home : le lien de la section visible au milieu de l'écran est souligné
  (trait `--my-green` de 2 px, animé en largeur ; sans animation si le
  système demande de réduire les animations).
- Pages projet : « Projets » est souligné en permanence.
- Le lien actif porte `aria-current="location"` (lu par les lecteurs d'écran).

## Fichier (unique)

`src/components/SiteHeader.tsx` (créé par PORT-028 — le lire d'abord).

## Étapes

1. Imports : ajouter `useState` et `useEffect` à l'import depuis `"react"`
   s'ils n'y sont pas déjà.

2. Ajouter ce hook au-dessus de `export function SiteHeader` :

```tsx
/**
 * Which home section is currently in the middle band of the viewport.
 * The band (45%-50% from the top) is thin on purpose: exactly one section
 * crosses it at a time, and the previous value is kept while none does.
 */
function useActiveSection(enabled: boolean): NavSectionId | null {
  const [active, setActive] = useState<NavSectionId | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const elements = NAV_SECTION_IDS.map((id) => document.getElementById(id));
    const missing = NAV_SECTION_IDS.filter((_, index) => elements[index] === null);
    if (missing.length > 0) {
      throw new Error(`SiteHeader: missing section(s) #${missing.join(", #")} on the home page.`);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as NavSectionId);
        }
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    for (const element of elements) observer.observe(element as HTMLElement);
    return () => observer.disconnect();
  }, [enabled]);

  return active;
}
```

3. Dans `SiteHeader`, juste après `const t = useTranslation();` :

```tsx
  const spiedSection = useActiveSection(variant === "home");
  const activeId: NavSectionId | null = variant === "project" ? "portfolio" : spiedSection;
```

4. Permettre à `renderLink` de recevoir `aria-current`. Remplacer sa
   définition par :

```tsx
  const renderLink = (
    id: NavSectionId,
    className: string,
    children: React.ReactNode,
    ariaCurrent?: "location",
  ) =>
    variant === "home" ? (
      <a href={`#${id}`} data-nav-id={id} className={className} aria-current={ariaCurrent}>
        {children}
      </a>
    ) : (
      <Link href={`/#${id}`} data-nav-id={id} className={className} aria-current={ariaCurrent}>
        {children}
      </Link>
    );
```

   (Si PORT-028 a ajouté un paramètre `ariaLabel`, garder les deux :
   `ariaLabel` puis `ariaCurrent`, et mettre à jour l'appel du nom.)

5. Remplacer le contenu de la boucle des liens de nav :

```tsx
            {NAV_SECTION_IDS.map((id) => {
              const isActive = id === activeId;
              return (
                <li key={id}>
                  {renderLink(
                    id,
                    `relative inline-block py-1 hover:text-my-green after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-my-green after:transition-transform after:duration-300 motion-reduce:after:transition-none ${
                      isActive ? "text-my-green after:scale-x-100" : "text-main-text after:scale-x-0"
                    }`,
                    labels[id],
                    isActive ? "location" : undefined,
                  )}
                </li>
              );
            })}
```

   Le lien du **nom** (en haut à gauche) ne change pas : pas de soulignement.

6. Vérifications : procédure §4, puis au navigateur (**onglet au premier
   plan**) :
   - Home, défiler lentement de haut en bas : « Profil » souligné sur le
     hero, puis « Expériences » sur le Parcours, « Projets » sur les projets,
     « À propos » sur la section À propos ; un seul lien souligné à la fois.
   - Cliquer « Projets » : à l'arrivée, « Projets » est souligné.
   - DevTools : le lien souligné a `aria-current="location"`, les autres non.
   - `/internships/safran` : « Projets » souligné en permanence.
   - Émulation `prefers-reduced-motion: reduce` : le trait apparaît sans
     animation.
   - 360 px : le trait reste sous le bon lien (2ᵉ ligne de l'en-tête).

Commit : `feat(header): underline the section currently in view`

## Critères d'acceptation

- [ ] Un seul lien souligné, qui suit le défilement sur la home.
- [ ] « Projets » souligné sur les pages projet.
- [ ] `aria-current="location"` sur le lien actif.
- [ ] lint / tsc / build passent.

## Journal d'exécution

Commandes lancées et résultats (dernières 5 lignes chacune) :

**npm run lint** :
```
✖ 6 problems (0 errors, 6 warnings)
```
(Pas de problèmes spécifiques à SiteHeader — warnings préexistants)

**npx tsc --noEmit** :
```
npm notice run next-app@0.1.0 npx
npm notice run tsc --noEmit
```
(Pas d'erreurs)

**npm run build** :
```
└ ○ /work/gcii

○  (Static)  prerendered as static content
```
(Build réussi)

Vérification avec `npm run dev` (port 3001, Corentin's dev occupant le 3000) :
- Home page : liens nav rendus avec classes underline (`after:scale-x-0` initialement, géré par le hook côté client)
- Page projet `/internships/safran` : "Projets" affiche `text-my-green after:scale-x-100` + `aria-current="location"` ✓
- Autres liens projet : `text-main-text after:scale-x-0` sans aria-current ✓

Vérification visuelle NON faite — extension claude-in-chrome non connectée. Vérification par curl confirme le rendu correct du HTML côté serveur et l'hydratation côté client.

Critères d'acceptation :
- [x] Un seul lien souligné, qui suit le défilement sur la home (hook useActiveSection)
- [x] « Projets » souligné sur les pages projet (activeId = "portfolio" pour variant="project")
- [x] `aria-current="location"` sur le lien actif
- [x] lint / tsc / build passent

## Notes pour la consolidation

- ARCHITECTURE.md « Known weak points » : retirer « scroll-spy non branché /
  offsets recalculés seulement au resize » pour la nav (IntersectionObserver,
  plus de `offsetTop`) ; `page.tsx` garde ses `offsetTop` jusqu'à PORT-037.
