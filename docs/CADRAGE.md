# Cadrage — Refonte du portfolio corentinbunaux.github.io

Date : 2026-09-26. Base de discussion : `plan-refonte-claude.md`, les deux
maquettes Canva importées dans `design/mockups/`, et un entretien de cadrage
mené avec Corentin.

## 1. Problème

C'est une vitrine personnelle sans enjeu commercial immédiat : elle sert à se
vendre en tant que candidat auprès d'opportunités potentielles, à montrer ce
que Corentin est capable de créer et la qualité de son travail, et à présenter
son parcours académique et ses projets. À terme, elle pourrait aussi servir de
point de départ pour du freelance, mais ce n'est pas l'objectif aujourd'hui.
Le problème n'est pas un incident ou un retour négatif documenté : c'est un
jugement de Corentin en relisant son propre site — certaines parties "font
travail d'étudiant", ont été négligées, et n'exploitent pas toutes les
technologies qu'il maîtrise aujourd'hui. Le site a aussi pris du retard sur sa
situation réelle : son poste actuel (GCII, en prestation pour Enedis) n'y
figure pas.

## 2. Critères de succès

1. Lighthouse Accessibility = 100 sur la page d'accueil et sur au moins une
   page projet.
2. Lighthouse Performance ≥ 90 en émulation mobile sur la page d'accueil.
3. Zéro échec de contraste WCAG AA détecté par un audit automatisé.
4. Les 7 zones de la maquette Canva "REFONTE" (accueil, Parcours, Projets,
   étude de cas en-tête, étude de cas corps, À propos, responsive/contact/pied
   de page) sont implémentées et traçables à leur zone de maquette.
5. Le sélecteur FR/EN fonctionne sur l'intégralité du site, traduction relue
   et validée par Corentin.
6. Le pipeline CI est vert (build + lint + typecheck) sur chaque push, et le
   déploiement GitHub Pages réussit sans intervention manuelle.
7. Le nouveau cas GCII/Enedis est publié aux côtés des 11 projets existants
   restructurés (12 pages projet au total), avec la portée du projet décrite
   plutôt qu'un chiffre inventé.

## 3. Périmètre

| Dans le périmètre | Hors périmètre |
| --- | --- |
| Refonte visuelle des 7 zones de la maquette Canva | CMS ou blog |
| Nouvelle section Parcours (timeline, 4 expériences) | Formulaire de contact avec backend (mailto uniquement) |
| Filtres Projets (Pro / Recherche / École / Perso) | Dashboard analytics |
| Gabarit page projet : fil d'Ariane, bloc "En bref", nav précédent/suivant, routage par prop/paramètre (fin du pattern `window.location.pathname`) | Tout nouveau projet au-delà de GCII/Enedis |
| Nouveau footer (contact, CV, liens) | Routes localisées `/fr` `/en` (le FR/EN reste un toggle client-side) |
| Design system : tokens de surface, contraste WCAG, suppression `vh`/`justify`/`user-select:none` | Suite de tests automatisés (aucune n'existe, non demandée) |
| i18n FR/EN (dictionnaire, toggle client) | Passation à un autre mainteneur |
| Accents three.js contextuels (hero + Safran + Quimesis + À propos), ≥1024px uniquement, repli `prefers-reduced-motion` | Section 3D dédiée |
| Migration image `next/image` + AVIF | — |
| Upgrade Next.js 15 + React 19 | — |
| CI/CD minimale : build, lint, typecheck, déploiement GitHub Pages | — |
| Nouveau cas GCII/Enedis (portée du projet, pas de chiffre inventé) | — |

## 4. Utilisateurs et usage

- **Mainteneur** : Corentin, seul, sans passation prévue.
- **Visiteurs** : recruteurs, clients ou prospects potentiels, en visite
  occasionnelle (pas de trafic récurrent attendu). Aucun analytics existant
  aujourd'hui — le volume et la répartition desktop/mobile réels des visiteurs
  sont une inconnue (voir §6).
- Les accents 3D contextuels sont conçus desktop-first (≥1024px) ; le site
  doit rester pleinement utilisable sur mobile sans eux.

## 5. Contraintes

- **Hébergement non négociable** : le site doit rester un export statique
  GitHub Pages, zéro backend, coût nul.
- **Pas de deadline fixe** : le rythme suit les sessions Claude Pro de
  Corentin et les resets de tokens — pas de date de livraison à respecter.
- **Solo** : une seule personne développe et maintient, pas de coordination
  d'équipe à prévoir.
- **Contenu** : rédaction FR faite par Corentin/reprise de l'existant ;
  traduction EN faite par Claude puis relue par Corentin avant publication.
- **Confidentialité déjà tranchée** : les noms GCII, Enedis et Safran Data
  Systems peuvent être affichés publiquement.

## 6. Hypothèses et inconnues (classées par risque)

1. **[Risque élevé] Performance de three.js non vérifiée.** Corentin n'a
   jamais utilisé three.js ; le hero doit afficher un maillage réactif au
   curseur. Test le moins cher : construire le canvas du hero en isolation
   (avant de le raccorder au reste de la refonte) et mesurer les FPS sur le
   téléphone et l'ordinateur réels de Corentin avant de répliquer le pattern
   sur Safran/Quimesis/À propos. Filet de sécurité déjà acté : rendu
   conditionnel ≥1024px + repli `prefers-reduced-motion` ; si même le desktop
   patine, on abandonne three.js et on garde uniquement les accents 2D
   existants (icônes, illustration tennis) — aucune section 3D dédiée n'a
   jamais été requise.
2. **[Risque moyen] Compatibilité Next 15 / React 19 avec l'export statique.**
   `next.config.mjs` a `output: "export"` commenté alors que la CI publie déjà
   `./out` — la CI est cassée dès aujourd'hui, indépendamment de l'upgrade.
   Test le moins cher : traiter la correction CI + l'upgrade de stack comme un
   lot isolé, vérifier que `next build` produit bien `out/` et que le site
   s'affiche correctement, avant de toucher au contenu.
3. **[Risque moyen] Réécriture du routage des pages projet.** `project.tsx`
   s'auto-détecte aujourd'hui via `window.location.pathname` plutôt que de
   recevoir le projet en prop/paramètre — les 12 pages en dépendent. Test le
   moins cher : migrer une seule page projet en premier, vérifier fil
   d'Ariane + nav précédent/suivant, avant de répliquer sur les 11 autres.
4. **[Risque faible] Qualité de la traduction anglaise.** Claude traduit,
   Corentin relit — le risque est un contresens sur un terme technique ou
   professionnel. Mitigation : relecture explicite avant de considérer l'i18n
   "fini".
5. **[Risque faible] Volume de travail image.** 9,3 Mo dans `public/`, aucun
   AVIF/WebP aujourd'hui. Chemin bien balisé (`next/image`), le risque est
   surtout le temps passé à renommer/réorganiser, pas un risque technique.

## 7. Modes d'échec

| Ce qui casse | Signal d'alerte | Mitigation |
| --- | --- | --- |
| three.js plombe les performances | FPS en chute / saccades pendant le prototype isolé du hero | Rendu conditionnel déjà prévu (≥1024px, `prefers-reduced-motion`) ; si insuffisant, abandon complet de three.js, on garde les accents 2D existants |
| L'export statique casse silencieusement | `next build` échoue ou `out/` est vide/incomplet | Corriger et vérifier la CI en tout premier lot, avant tout travail de contenu |
| Dérive de périmètre au-delà de la maquette | Une session commence à ajouter une section absente des 7 zones Canva ("le canva reste très global" — mots de Corentin) | Chaque ticket référence explicitement la zone de maquette (1 à 7) qu'il implémente ; tout ce qui n'y est pas traçable déclenche un mini-cadrage, pas un ajout silencieux |
| Une information publiée sur GCII/Enedis pose problème a posteriori | Aucun signal automatique | Relecture par Corentin du contenu GCII/Enedis avant fusion, vu qu'il s'agit d'un emploi en cours |

## 8. Décisions ouvertes

1. **Structure des données projet.** `projectsSection.jsx` contient
   aujourd'hui un tableau JS non typé, unique source de vérité des 12 projets.
   Options : (a) le garder tel quel et l'étendre pour GCII/Enedis, ou
   (b) l'extraire en module typé `src/data/projects.ts`. Recommandation : (b),
   puisque c'est déjà de facto la source de vérité et que le passage à
   TypeScript strict (upgrade Next 15) s'y prête naturellement.
2. **Séquencement du cas GCII/Enedis.** Options : (a) rédiger son contenu
   avant que le nouveau gabarit de page projet existe, ou (b) attendre la
   refonte du gabarit puis l'y intégrer directement. Recommandation : (b),
   pour ne construire la page qu'une seule fois, avec le bon gabarit.

Ces deux points sont volontairement laissés à trancher au moment du
`/ticket` correspondant plutôt que maintenant — ce sont des détails
d'implémentation, pas des inconnues qui changent la portée du projet.

## 9. Évaluation

Ce qui est solide : la direction visuelle est entièrement spécifiée (deux
maquettes Canva lues et comprises), les corrections d'accessibilité et de
tokens sont concrètes et à faible risque, et le bug de CI est isolé et
clairement identifié. Tous les faits de contenu qui manquaient (dates,
intitulés, confidentialité, adresse e-mail) ont été obtenus pendant cet
entretien — il ne reste rien à inventer.

Ce qui est plus fragile : le risque de performance de three.js est réel et
non testé — c'est une première utilisation de la bibliothèque, et qui plus
est sur la partie la plus visible de la page (le hero). Par ailleurs, la
propre remarque de Corentin ("le canva reste très global", et sa tolérance
implicite à ce que three.js/i18n glissent si le temps manque) suggère que
tous les critères de succès ne sont pas au même niveau de priorité : le
contenu et l'accessibilité comptent plus que le three.js et l'i18n. Le
backlog devra refléter cet ordre plutôt que traiter les 7 critères de succès
comme un bloc unique et indivisible.

Le projet vaut clairement d'être fait : périmètre bien délimité, direction
validée sans ambiguïté, coût d'infrastructure nul, aucune pression de délai.
Rien ne justifie de le déconseiller.

---

**Trois inconnues les plus risquées :**
1. Performance réelle de three.js dans le hero (jamais testé par Corentin).
2. Compatibilité de l'upgrade Next 15 / React 19 avec l'export statique déjà
   cassé aujourd'hui (`output: "export"` commenté alors que la CI attend `out/`).
3. Régression silencieuse sur les 12 pages projet lors du remplacement du
   pattern `window.location.pathname` par un routage en props/paramètres.

**Prochaine action unique :** lancer `/backlog` sur ce document pour découper
le travail en jalons et tickets, en mettant la correction CI/upgrade de stack
en premier (le risque le plus élevé à isoler tôt), et en séquençant
three.js/i18n après le contenu et l'accessibilité — cohérent avec la
priorité implicite de Corentin.
