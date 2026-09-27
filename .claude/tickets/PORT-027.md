---
id: PORT-027
title: "Footer — retirer la phrase « Ouvert aux missions… » et pointer « Profil » sur #home"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: done
resumeAt: null
priority: P2
estimate: 0.1
confidence: high
model: haiku
branch: fix/PORT-027-footer-availability
depends_on: [PORT-024]
parallel_safe: true
human_checkpoint: null
created: 2026-09-27
---

# Footer — retirer la phrase de disponibilité

**Procédure** : `docs/PROCEDURE-TICKET.md`.

## Retour de Corentin (#16)

> Retirer le texte « Ouvert aux missions en prestation depuis Le Havre, sur
> site à La Défense ou à distance. »

Au passage : la section `#profile` va disparaître (fusionnée dans le hero par
PORT-037). Le lien « Profil » du footer doit donc viser `#home`, qui existe
déjà aujourd'hui — le changement est sans risque dès maintenant.

## Fichiers (uniquement ceux-ci)

- `src/components/footer.jsx`
- `src/i18n/namespaces/footer.ts`

## Étapes

1. `src/components/footer.jsx` : supprimer entièrement le paragraphe

   ```jsx
   <p className="mt-2 text-second-text">
     {t.footer.availability}
   </p>
   ```

   Le lien « Me contacter » qui suit a la classe `mt-4` : la laisser (elle
   espace désormais le lien du titre, c'est voulu).
2. Même fichier, dans `NAV_LINKS` : remplacer
   `{ label: t.common.profile, href: '#profile' }` par
   `{ label: t.common.profile, href: '#home' }`.
3. `src/i18n/namespaces/footer.ts` : supprimer la clé `availability` de
   l'interface `FooterDict`, de `footerFr` et de `footerEn`.
4. `grep -rn "availability" src` ne doit plus rien renvoyer.
5. Vérifs de la procédure (§4). Visuel : bas de la home en FR et en EN, la
   phrase a disparu, le bouton « Me contacter » est toujours sous le titre
   « Travaillons ensemble ».

Commit : `fix(footer): drop the availability line, link Profil to #home`

## Critères d'acceptation

- [ ] La phrase n'apparaît plus, ni en FR ni en EN.
- [ ] Le lien « Profil » du footer mène en haut de la home.
- [ ] lint / tsc / build passent.

## Journal d'exécution

**npm run lint** (dernières 5 lignes):
```
✖ 3 problems (0 errors, 3 warnings)
```
Warnings pré-existants dans LanguageContext.tsx.

**npm run build** (dernières 5 lignes):
```
○  (Static)  prerendered as static content
```
Build réussi.

**npx tsc --noEmit** (après build):
```
npm notice run next-app@0.1.0 npx
npm notice run tsc --noEmit
```
Succès (pas d'erreur).

**grep -rn "availability" src**:
Aucun résultat (clé supprimée avec succès).

**Vérification visuelle**: NON faite, outil claude-in-chrome indisponible.

**Étapes réalisées**:
- ✓ Étape 1: Paragraphe d'availability supprimé de footer.jsx
- ✓ Étape 2: Lien "Profil" changé de #profile à #home
- ✓ Étape 3: Clé availability supprimée du dictionnaire i18n (interface, footerFr, footerEn)
- ✓ Étape 4: Vérification grep OK
- ✓ Étape 5: lint, tsc, build OK

**Critères d'acceptation**:
- ✓ La phrase n'apparaît plus (supprimée du JSX et du dictionnaire i18n)
- ✓ Le lien « Profil » du footer mène en haut de la home (#home)
- ✓ lint / tsc / build passent

## Notes pour la consolidation

Rien pour ARCHITECTURE.md.
