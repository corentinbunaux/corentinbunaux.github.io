# Procédure commune — exécuter un ticket de la recette (PORT-024 → PORT-051)

> À lire **en entier** avant de toucher au code. Chaque ticket y renvoie au
> lieu de répéter ces étapes. Écrite pour un modèle d'exécution (Haiku ou
> Sonnet) qui suit les instructions à la lettre : si une étape est impossible,
> on s'arrête et on écrit pourquoi, on n'improvise pas.

## 0. Règles qui priment sur tout

- **Un ticket = une session = une branche.** Ne rien faire qui n'est pas
  demandé dans le ticket. Une idée d'amélioration → une ligne dans la section
  « Notes pour la consolidation » du ticket, pas du code.
- **Ne jamais** : `git push --force`, commit sur `main`, supprimer/réécrire un
  fichier non listé dans le ticket, ajouter une dépendance non listée dans le
  ticket, toucher `public/img/Avatar_Coco.png`, éditer `public/img` ou
  `public/logos` à la main (toujours `npm run optimize:images`), repasser
  ESLint en `^10`, tuer un serveur `next dev` déjà lancé (utiliser l'existant
  sur `http://localhost:3000`, ou le port que Next propose).
- **Ne rien inventer** : pas de nom d'icône, d'API ou d'URL non vérifié. Si le
  ticket dit « vérifier », vérifier (grep dans `node_modules`, doc officielle).
- **Deux échecs sur le même problème = stop.** Écrire ce qui a été tenté dans
  la section « Journal d'exécution » du ticket, passer le ticket en `blocked`,
  et s'arrêter.
- **Fichiers partagés interdits en parallèle** : ne PAS modifier
  `ARCHITECTURE.md`, `PASSATION.md`, `docs/BACKLOG.md` (sauf si le ticket le
  demande explicitement — seul PORT-051 le fait). À la place, remplir la
  section « Notes pour la consolidation » en bas du ticket.
- Textes affichés : **toujours** via le dictionnaire i18n (FR + EN), jamais en
  dur. Couleurs : **toujours** via les tokens CSS (`var(--main)`, classes
  Tailwind `bg-surface`, `text-main-text`…), jamais `#xxxxxx` dans un composant.
- Encodage : tous les fichiers en UTF-8. Après avoir écrit un fichier contenant
  du français, vérifier qu'il n'y a pas de `Ã©` / `â€` (mojibake) :
  `grep -n "Ã\|â€" <fichier>` doit ne rien renvoyer.

## 1. Démarrer

```bash
cd C:/Users/coren/Documents/corentinbunaux.github.io
git fetch --all --prune   # sans effet si pas de remote, pas grave
git checkout refonte-2026
git pull --ff-only 2>/dev/null || true
```

1. Ouvrir le ticket `.claude/tickets/PORT-0XX.md`.
2. Vérifier que **chaque** ticket listé dans `depends_on` est `status: done`
   **et** que sa branche est fusionnée dans `refonte-2026` :
   `git branch --merged refonte-2026 | grep PORT-0YY`. Si ce n'est pas le cas :
   stop, ne pas commencer.
3. Passer le ticket en `status: in-progress` (frontmatter) — ne pas committer
   ce changement seul, il partira avec le travail.

## 2. Worktree isolée (obligatoire quand plusieurs tickets tournent en même temps)

```bash
# <branche> est donnée dans le ticket, ex. feat/PORT-029-about-interests
git worktree add ../wt-PORT-0XX -b <branche> refonte-2026
cd ../wt-PORT-0XX
npm ci            # node_modules n'est pas partagé entre worktrees
```

Toutes les commandes suivantes se lancent **dans** `../wt-PORT-0XX`.
Si `npm ci` échoue : stop, noter l'erreur exacte dans le journal du ticket.

## 3. Implémenter

Suivre les étapes numérotées du ticket **dans l'ordre**. Les blocs de code
donnés sont à reprendre tels quels (adapter seulement ce que le ticket dit
d'adapter). Lire un fichier avant de le modifier ; lire la zone utile, pas
tout le fichier s'il est long.

## 4. Vérifier (preuve exigée, pas d'affirmation)

Dans la worktree :

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Les trois doivent réussir. **Il n'y a pas de `npm test`** dans ce projet : ne
pas prétendre l'avoir lancé. Copier les 5 dernières lignes de sortie de chaque
commande dans le « Journal d'exécution » du ticket.

Vérification visuelle (obligatoire pour tout ticket qui change l'affichage) :
lancer `npm run dev` dans la worktree (il prendra le port 3001 ou suivant si
3000 est pris), ouvrir la page au navigateur (outil `claude-in-chrome` si
disponible), vérifier chaque critère d'acceptance **en thème sombre ET clair**
(à partir de PORT-026), à 1280 px et à 360 px de large. Si aucun navigateur
n'est disponible, l'écrire explicitement dans le journal : « vérification
visuelle NON faite, outil indisponible » — ne jamais écrire « vérifié » sans
l'avoir fait.

Note : un onglet d'automatisation en arrière-plan peut ignorer
`scroll-behavior: smooth` (onglet caché = `document.visibilityState ===
"hidden"`). Ce n'est pas un bug du site (voir PORT-022). Tester le scroll dans
un onglet au premier plan.

## 5. Committer

```bash
git add <uniquement les fichiers du ticket>
git diff --staged        # LIRE le diff ; retirer tout ce qui n'est pas demandé
git commit -m "<type>(<scope>): <résumé impératif < 72 caractères>

Refs PORT-0XX.

Co-Authored-By: Claude <noreply@anthropic.com>"
```

- Ne jamais committer : `.env*`, `node_modules/`, `.next/`, `out/`, un
  `CLAUDE.md` généré par `next dev` dans un sous-dossier, un fichier
  `recette-utilisateur.md` (propriété de Corentin).
- Un commit par changement logique. Le ticket peut en prévoir plusieurs.

## 6. Fusionner dans `refonte-2026` (c'est au modèle qui exécute le ticket de le faire)

```bash
cd C:/Users/coren/Documents/corentinbunaux.github.io   # le dépôt principal
git checkout refonte-2026
git merge --no-ff <branche> -m "Merge PORT-0XX: <titre court>"
```

### En cas de conflit

Les zones à risque connues (plusieurs tickets les touchent) :

| Fichier | Qui y touche | Règle de résolution |
| --- | --- | --- |
| `src/components/ProjectPage.tsx` | 028, 031, 033, 035, 036 | Garder **les deux** côtés. Imports : union des deux listes, sans doublon. |
| `src/components/demos/registry.ts` | 031 puis chaque ticket de démo | Chaque ticket ne change que **sa** ligne `ready: false → true`. Garder les deux. |
| `src/i18n/namespaces/demos.ts` | 031 puis 042, 045, 048 | 042 ajoute le bloc `spaceTime` ; 045/048 ne changent que leurs légendes. Garder les deux. |
| `src/data/projects.ts` | 032, 036 | 036 supprime les blocs `pageContent` ; 032 change une ligne `img`. Garder les deux. |
| `src/app/app.css` | 025, 026, 029, 043 | Blocs distincts ; garder les deux. |
| `src/app/page.tsx` | 028, 037 | 037 réécrit l'assemblage ; partir de la version 037 et ré-appliquer 028 s'il manque. |
| `package.json` / `package-lock.json` | 026 seulement | Ne devrait pas conflicter. Si oui : garder les deux dépendances puis `npm install` pour régénérer le lock. |

Procédure : ouvrir chaque fichier en conflit, résoudre selon la règle,
`git add`, `git commit`. Puis **relancer** `npm run lint && npx tsc --noEmit
&& npm run build` sur `refonte-2026`. Si la résolution n'est pas évidente
(les deux côtés modifient la même ligne avec des intentions différentes) :
`git merge --abort`, noter le conflit dans le journal, passer le ticket en
`blocked`, s'arrêter.

## 7. Nettoyer et clôturer

```bash
git worktree remove ../wt-PORT-0XX
git branch -d <branche>        # -d (pas -D) : refuse si non fusionnée, c'est voulu
```

Dans le ticket (sur `refonte-2026`, commit `docs(tickets): close PORT-0XX`) :

- `status: review` si le ticket a un `human_checkpoint` non nul, sinon `done`.
- Remplir « Journal d'exécution » : commandes lancées + sortie, ce qui a été
  vérifié visuellement (ou pas), écarts par rapport au ticket.
- Remplir « Notes pour la consolidation » : ce que PORT-051 devra reporter
  dans `ARCHITECTURE.md` (nouveau fichier, décision, point faible).

Pas de `git push` sauf si Corentin l'a demandé dans la session.
