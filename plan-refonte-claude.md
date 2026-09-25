# Refonte portfolio — plan & état d'avancement

Design Canva : https://www.canva.com/design/DAHV3XF3VTk/zfndA_rFyKp3t82MQGVyVw/edit
Code : `C:\Users\coren\Documents\corentinbunaux.github.io` (Next.js 14 + Tailwind, export statique GitHub Pages)

## Arbitrages validés (21/09/2026)

- Format Canva : deux planches 1600 × 2600 px.
- Ton : traits plus professionnels, **mais** on garde les icônes centres d'intérêt et l'illustration tennis — elles servent de démonstration d'animation.
- 3D : pas de section dédiée. Des accents contextuels, affichés seulement si le navigateur et la taille d'écran le permettent (satellites/orbites sur Safran, mâchoire VTK.js sur Quimesis, balle sur À propos, maillage dans le hero).
- Langue : FR + EN avec sélecteur dans la nav.

## Tokens relevés dans l'existant (`src/app/app.css`)

| Variable | Valeur | Rôle |
|---|---|---|
| `--main` | `#1a1a1a` | fond |
| `--secondary` | `#333333` | surface |
| `--my-green` | `#81a3a7` | accent principal |
| `--my-blue` | `#a7bcc7` | accent secondaire |
| `--main-text` | `#f5f5f5` | texte |
| `--second-text` | `#666666` | texte secondaire (contraste insuffisant) |
| — | `#dfff4f` | balle de tennis |

## Étape 1 — Design (FAIT)

**Page 1 — « SITE ACTUEL »** : maquette filaire vectorielle de l'existant, 6 écrans (Accueil, Profil & Compétences, Portfolio, À propos, page projet Safran, page projet Quimesis) + inventaire des composants, palette et limites relevées. Chaque élément est un objet Canva distinct, pas une capture.

**Page 2 — « REFONTE »** : proposition v1, 7 zones (hero large, Parcours, Projets, étude de cas en-tête, étude de cas corps, À propos, responsive/contact/footer) + synthèse « ce qui change » en trois axes.

## Étape 2 — Code (À FAIRE, après retouches manuelles du design)

### Structure & contenu
- Réécrire le statut : ingénieur diplômé des Mines de Saint-Étienne, en prestation depuis Le Havre pour un client à La Défense. Fichiers concernés : `src/components/profileSection.jsx`, `src/components/homepage.jsx`, `src/app/internships/*/page.tsx`.
- Nouvelle section `Parcours` (timeline) entre Profil et Portfolio.
- `projectsSection.jsx` : filtres par nature (Pro / Recherche / École / Perso), projet phare en double largeur, résultat en une ligne par carte.
- `project.tsx` : ajouter fil d'Ariane, bloc « En bref » collant, visuel d'en-tête, navigation projet précédent/suivant.
- Créer un vrai `footer.jsx` : contact, CV PDF, liens.
- i18n FR/EN (dictionnaire JSON + sélecteur, pas de dépendance serveur pour rester compatible export statique).

### Interface
- Ajouter surfaces `#202020` / `#2a2a2a`, bordures `#2f2f2f`, état de focus visible.
- Remonter le corps de texte de `#666` à `#8f8f8f` minimum (WCAG AA).
- Supprimer `text-align: justify`, revenir au fer à gauche.
- Remplacer les hauteurs en `vh` par du padding (le `app.css` actuel fixe 100→500 vh selon le breakpoint).
- Retirer `user-select: none` sur `body`, rétablir la barre de défilement.
- Cartes projet : titre hors de l'image, vignette 16:9, pastilles de techno.

### Technique
- `three.js` dans le hero (maillage réactif au curseur), `dynamic import` + rendu conditionnel `≥ 1024 px`.
- Accents 3D contextuels par page projet.
- Respect de `prefers-reduced-motion` : image fixe de repli.
- `next/image` + AVIF, budget de performance.

## Points à confirmer

1. Dates et intitulés exacts des expériences (Safran, Quimesis, Kusmi Tea) — placeholders dans la maquette.
2. Chiffres de résultat des études de cas (le « −35 % » de la page Safran est un exemple à remplacer).
3. Adresse e-mail de contact à afficher.
4. Intitulé exact du poste chez Safran Data Systems et mention (ou non) du nom du client.