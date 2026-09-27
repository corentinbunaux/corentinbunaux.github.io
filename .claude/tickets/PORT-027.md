---
id: PORT-027
title: "Footer — retirer la phrase « Ouvert aux missions… » et pointer « Profil » sur #home"
group: corentin
machine: asus_corentin
milestone: M6 — Recette utilisateur
status: ready
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

_(à remplir)_

## Notes pour la consolidation

Rien pour ARCHITECTURE.md.
