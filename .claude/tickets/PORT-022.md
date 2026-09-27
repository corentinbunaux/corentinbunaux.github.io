---
id: PORT-022
title: "Bug — le scroll JS behavior:'smooth' ne scrolle jamais (window.scroll/scrollTo)"
group: corentin
machine: asus_corentin
milestone: M2 — Design system & accessibilité
status: done
resumeAt: null
priority: P2
estimate: 0.5
confidence: low
depends_on: []
parallel_safe: true
human_checkpoint: null
created: 2026-09-26
---

# Bug — le scroll JS `behavior:'smooth'` ne scrolle jamais

**Contexte** — Repéré indépendamment par PORT-006, PORT-012 et PORT-009 :
tous les clics de nav (`navbar.jsx`, `profileSection.jsx`, `homepage.jsx`)
appellent `window.scroll({ top, left, behavior: "smooth" })` et ne
provoquent **aucun scroll visible**. Jusqu'ici documenté comme "pré-existant,
hors périmètre" sans diagnostic précis.

## Diagnostic (isolé dans cette session, navigateur réel via `claude-in-chrome`)

Testé directement dans la console sur `/` (`npm run dev`) :

```js
window.scroll({ top: 2564, left: 0, behavior: 'auto' });   // → scrollY = 2564 ✅
window.scrollTo({ top: 2564, left: 0, behavior: 'smooth' }); // → scrollY = 0 ❌ (après 1s d'attente)
document.documentElement.scrollTop = 500;                    // → fonctionne ✅ (instantané)
```

**Le problème est précisément `behavior: 'smooth'`**, pas un mauvais élément
de scroll (`document.scrollingElement` est bien `<html>`, comme attendu — la
théorie d'un `body` devenu conteneur de scroll via `overflow-x: hidden`
avancée par PORT-012 n'est **pas confirmée** par ce test : le scroll
instantané sur `<html>` fonctionne très bien, seul le smooth échoue).

Hypothèses à vérifier en premier (non testées ici, ordre de suspicion) :
1. Une règle CSS forçant `scroll-behavior` autrement (`app.css` ne semble pas
   en définir sur `html`, à re-vérifier après le merge de tous les tickets
   M2/M3 en cours).
2. Interaction avec le changement de comportement de scroll de Next.js 16
   (voir le guide de migration : Next.js 16 ne réécrit plus lui-même
   `scroll-behavior` pendant les transitions de route — mais ceci est un
   scroll intra-page, pas une navigation de route, donc probablement sans
   rapport direct ; à vérifier quand même).
3. `prefers-reduced-motion` actif dans l'environnement de test qui neutrali-
   serait silencieusement tout scroll animé (peu probable si `auto`
   fonctionne mais `smooth` échoue totalement plutôt que d'être juste plus
   rapide).

**Livrable** — Le scroll fluide (`behavior: 'smooth'`) fonctionne pour tous
les liens de nav et CTA du site.

**Test plan** — Reproduire au navigateur (`npm run dev`, console), tester les
3 hypothèses ci-dessus une par une, corriger, puis vérifier que chaque lien
de nav scrolle visiblement et en douceur.

**Out of scope** — Remplacer le mécanisme de scroll par des ancres natives
(`<a href="#id">`) — solution de repli déjà écartée par PORT-006 car elle
changerait le comportement (saut au lieu de smooth) sans le corriger vraiment.

## Résolution (2026-09-27) — faux positif, clos sans modification de code

Re-testé en session : `overflow-x: clip` sur `html`/`body` → aucun effet ;
page vierge sans aucun CSS → `scrollY` reste aussi à 0 avec `behavior:
'smooth'`. L'onglet piloté par l'automatisation était en arrière-plan
(`document.visibilityState === "hidden"`, `document.hasFocus() === false`) :
Chrome n'anime pas un scroll fluide dans un onglet caché. Le site n'est pas en
cause. Dans un onglet au premier plan, le scroll fluide fonctionne.

Conséquence : PORT-028 passe la navigation en ancres natives +
`scroll-behavior: smooth` CSS (PORT-025), sans contournement.
