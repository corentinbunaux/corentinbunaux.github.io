# Backlog — Refonte portfolio corentinbunaux.github.io

Source : `docs/CADRAGE.md`. 21 tickets, 5 jalons. Chaque ticket vit dans
`.claude/tickets/<ID>.md` (`status: draft`) ; `/ticket <ID>` le précise avant
qu'une session ne l'exécute avec `/work <ID>`.

## Jalons

| Jalon | Sortie observable | Priorité |
| --- | --- | --- |
| **M1 — Fondations** | Le site se construit et se déploie sur Next 15/React 19 en export statique, une CI minimale gate chaque push, le risque three.js est connu (GO/NO-GO) | P0 |
| **M2 — Design system & accessibilité** | Lighthouse Accessibility=100, Performance≥90 mobile, zéro échec de contraste WCAG AA | P1 |
| **M3 — Contenu & structure** | Les 7 zones de la maquette "REFONTE" sont implémentées avec le contenu réel (dont GCII/Enedis), relu par Corentin | P1 |
| **M4 — i18n FR/EN** | Le site est intégralement bilingue via un toggle, traductions relues | P2 |
| **M5 — Accents 3D** | Hero + accents contextuels (Safran, Quimesis) en place, sans régression de performance | P3 |
| **M6 — Recette utilisateur** | 16 retours de la recette du 2026-09-26 traités (`docs/PLAN-RECETTE.md`) : thème clair/sombre, en-tête commun, hero façon maquette, Parcours à deux pistes, articles Markdown, 10 démos 2D/3D, consolidation de la documentation | P1 |

Ordre volontaire : M1 isole et retire le risque le plus élevé (CI cassée +
upgrade + faisabilité three.js) avant tout le reste. M2/M3 portent la valeur
principale (ce que Corentin a dit compter le plus). M4/M5 sont séquencés en
dernier — priorité explicitement plus basse selon le cadrage. M6 est un jalon
ultérieur, ouvert par une recette utilisateur une fois M1-M5 livrés (source :
`docs/PLAN-RECETTE.md`, pas `docs/CADRAGE.md`).

## Tickets

| ID | Titre | Jalon | Estim. | Confiance | Dépend de | Parallélisable |
| --- | --- | --- | --- | --- | --- | --- |
| PORT-001 | Corriger la CI/CD (export statique + gate lint/typecheck) | M1 | 1.0 | high | — | oui |
| PORT-002 | Upgrade Next 15 + React 19 | M1 | 1.5 | medium | PORT-001 | non |
| PORT-003 | [Recherche] Faisabilité hero three.js | M1 | 1.0 | low | PORT-002 | oui |
| PORT-004 | Tokens CSS & accessibilité globale | M2 | 1.5 | high | PORT-002 | oui |
| PORT-005 | Images → next/image + AVIF | M2 | 1.5 | high | PORT-002 | oui |
| PORT-006 | Navbar accessible | M2 | 0.5 | high | PORT-004 | oui |
| PORT-007 | Checkpoint M2 (Lighthouse/WCAG) | M2 | 0.5 | high | PORT-004, PORT-005, PORT-006 | non |
| PORT-008 | Données projet typées + entrée GCII/Enedis | M3 | 1.0 | high | PORT-002 | oui |
| PORT-009 | Zone① Accueil/hero réel ⚠️CV requis | M3 | 1.5 | medium | PORT-008 | oui |
| PORT-010 | Zone② Parcours (timeline) | M3 | 1.0 | high | PORT-008 | oui |
| PORT-011 | Zone③ Projets (filtres, carte vedette) | M3 | 1.5 | medium | PORT-008, PORT-005 | oui |
| PORT-012 | Gabarit page projet (pilote Safran) | M3 | 2.0 | medium | PORT-008 | oui |
| PORT-013 | Gabarit déployé sur 11 pages restantes | M3 | 1.5 | high | PORT-012 | non |
| PORT-014 | Zone⑥ À propos ⚠️ambiguïté balle 2D/3D | M3 | 1.0 | medium | PORT-008 | oui |
| PORT-015 | Zone⑦ Footer réel ⚠️CV requis | M3 | 1.0 | medium | PORT-008 | oui |
| PORT-016 | Checkpoint M3 (7 zones + relecture GCII/Enedis) | M3 | 0.5 | high | PORT-009,010,011,013,014,015 | non |
| PORT-017 | Infra i18n FR/EN | M4 | 1.5 | medium | PORT-016 | non |
| PORT-018 | Traduction complète FR/EN | M4 | 2.0 | medium | PORT-017 | non |
| PORT-019 | Hero three.js (si GO) | M5 | 1.5 | low | PORT-003, PORT-009 | oui |
| PORT-020 | Accents contextuels (Safran, Quimesis/VTK.js) | M5 | 2.0 | low | PORT-019, PORT-012 | non |
| PORT-021 | Checkpoint M5 (re-audit perf) | M5 | 0.5 | high | PORT-019, PORT-020 | non |

**Total : 23,5 demi-journées** (~12 jours équivalent humain), plage réaliste
**23,5–32 demi-journées** compte tenu des tickets à confiance medium/low
(PORT-002, 009, 011, 012, 017, 018, 019, 020) — l'hypothèse est qu'aucun ne
dérape gravement ; PORT-003 (recherche) sert justement à retirer la plus
grosse incertitude tôt.

## M6 — Recette utilisateur (PORT-024 à 051)

Source : `docs/PLAN-RECETTE.md` (16 retours de Corentin sur M1-M5 + réponses
données en session). Procédure commune : `docs/PROCEDURE-TICKET.md` ; règles
communes des scènes 3D : `docs/GUIDE-3D.md`. Toutes les branches fusionnent
dans `refonte-2026`. Statuts ci-dessous relevés directement dans
`.claude/tickets/` (frontmatter `status`) à la clôture de PORT-051 ;
`review` signifie fusionné et vérifié par l'agent, mais avec un
`human_checkpoint` encore ouvert pour Corentin (liste complète dans
`PASSATION.md`).

| ID | Titre | Statut |
| --- | --- | --- |
| PORT-024 | i18n — dictionnaire découpé par namespace | done |
| PORT-025 | CSS — `overflow-x: clip`, scroll fluide natif, hauteur d'en-tête en token | done |
| PORT-026 | Thème clair/sombre + `lucide-react` | review |
| PORT-027 | Footer — retirer la phrase de disponibilité | done |
| PORT-028 | En-tête commun `SiteHeader` (nav, langue, thème) | review |
| PORT-029 | À propos — intérêts actifs/archivés, icônes, bouton PUSH | review |
| PORT-030 | Parcours — deux pistes Expérience / Formation, ordre décroissant | review |
| PORT-031 | Section « Démo », registre, socle three.js (`ThreeStage`) | done |
| PORT-032 | Illustration GCII/Enedis (SVG généré) | review |
| PORT-033 | Logos des technos dans l'en-tête d'article | done |
| PORT-034 | Soulignement de la section courante (nav) | done |
| PORT-035 | « En bref » : alignement + sticky sous l'en-tête | review |
| PORT-036 | Articles en Markdown (FR/EN), lus au build | review |
| PORT-037 | Hero façon maquette + fusion du Profil | review |
| PORT-038 | Démo : démineur 9×9 | review |
| PORT-039 | Démo : surveillants 10×10 | review |
| PORT-040 | Démo : Dactylo Race solo | review |
| PORT-041 | Démo : dictionnaire de prédiction | done |
| PORT-042 | Démo : graphique espace-temps SNCF (2D) | review |
| PORT-043 | Tennisman : bras redessiné + frappe animée | review |
| PORT-044 | Hero : globe filaire + icônes en orbite (3D) | review |
| PORT-045 | Démo 3D Safran : Terre, satellites, chasseur stylisé | review |
| PORT-046 | Démo 3D SNCF : train sur voie | done |
| PORT-047 | Démo 3D Systèmes embarqués : voiture qui se gare | done |
| PORT-048 | Démo 3D Robotique : bras d'exosquelette | review |
| PORT-049 | Démo 3D Quimesis : mâchoire interactive | review |
| PORT-050 | Parcours : icônes 3D diplôme / mallette | done |
| PORT-051 | Consolidation : docs + recette clair/mobile | review (ce ticket — `human_checkpoint` : nouvelle recette complète par Corentin) |

**PORT-022** (`Bug — le scroll JS behavior:'smooth' ne scrolle jamais`,
jalon M2) est **clos comme faux positif** : l'onglet de test automatisé était
en arrière-plan (`document.visibilityState === "hidden"`), ce que Chrome ne
scrolle jamais en fluide ; le site n'avait pas de bug. Sa conséquence
positive (nav en ancres natives + `scroll-behavior: smooth`) est livrée par
PORT-025/028.

Tous les tickets PORT-024 à PORT-050 sont fusionnés dans `refonte-2026`
(vérifié via `git log --oneline refonte-2026`, un commit `Merge PORT-0XX: ...`
par ticket). Aucun n'est `blocked` à l'ouverture de PORT-051. Un `status:
review` bloque uniquement la clôture définitive du ticket, pas la suite du
travail (voir `docs/PROCEDURE-TICKET.md` §1).

## Chemin critique

**PORT-001 → PORT-002 → PORT-008 → PORT-012 → PORT-013 → PORT-016 → PORT-017
→ PORT-018**, soit **11,0 demi-journées** (~5,5 jours équivalent humain).

Ce qui le raccourcirait : PORT-017 (infra i18n) attend aujourd'hui la
fermeture complète de M3 (PORT-016), alors qu'il n'a réellement besoin que
d'un contenu stable, pas de la totalité des 7 zones. Si Corentin est prêt à
démarrer l'i18n dès que le gabarit de page projet (PORT-013) et le contenu
principal sont posés — sans attendre PORT-014/PORT-015 — le chemin critique
se raccourcit d'environ une demi-journée à une journée.

## Ensemble parallélisable

- Une fois **PORT-002** fusionné : **PORT-003, PORT-004, PORT-005, PORT-008**
  peuvent démarrer en même temps (aucun ne dépend des autres).
- Une fois **PORT-008** fusionné (et PORT-005 pour PORT-011) : **PORT-009,
  PORT-010, PORT-011, PORT-012, PORT-014, PORT-015** peuvent tous démarrer en
  parallèle — c'est le plus gros gain possible si plusieurs sessions
  tournent de front.
- **PORT-019** peut démarrer dès que PORT-003 et PORT-009 sont faits, sans
  attendre M4 — il tourne en parallèle du jalon i18n.

## Par quoi commencer

1. **PORT-001** — corrige un bug de CI déjà présent aujourd'hui, indépendant
   de tout le reste, zéro risque de contenu.
2. **PORT-002** — débloque tout M2 et M3 ; le faire tôt évite de refaire du
   travail CSS/contenu deux fois sur deux versions de React.
3. **PORT-003** — c'est la plus grosse inconnue du chantier (three.js jamais
   utilisé) ; la trancher tôt évite de découvrir un NO-GO après avoir
   construit dessus dans M5.

## Ce que le cadrage n'a pas pu devenir un ticket propre

- **Fichier CV en PDF** — la maquette prévoit un bouton "Télécharger le CV" en
  zone ① et zone ⑦ (PORT-009, PORT-015), mais aucun fichier n'a été fourni ni
  demandé pendant `/cadrage`. Signalé en ⚠️ dans les deux tickets ; `/ticket`
  doit le redemander avant de les passer `ready`.
- **Traitement 2D/3D de la balle de tennis "À propos"** — `plan-refonte-claude.md`
  la liste à la fois comme accent 2D conservé et comme accent 3D contextuel
  du jalon M5. Signalé en ⚠️ dans PORT-014 ; à trancher avec Corentin avant
  `/ticket` sur PORT-014 (et PORT-020 si la réponse est "3D").
- Les deux décisions ouvertes du cadrage (structure des données projet,
  séquencement du cas GCII/Enedis) sont résolues par la structure même du
  backlog (PORT-008 en fondation, PORT-013 après le gabarit) — rien à
  reporter ici.
