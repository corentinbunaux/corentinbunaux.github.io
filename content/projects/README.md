# Articles des projets

Un fichier par projet et par langue : `<route>.fr.md` et `<route>.en.md`
(la route est celle de la page, ex. `research/sncf` → `research/sncf.fr.md`).

Format :

- `## Titre` ouvre une section (la première est le contexte) ;
- les paragraphes sont séparés par une ligne vide ;
- rien d'autre n'est interprété : pas de gras, de liens ni de listes ;
- le français et l'anglais doivent garder **le même nombre de sections**,
  sinon `npm run build` échoue en indiquant le fichier.

Après une modification : relancer `npm run dev` (les fichiers sont lus au
build, pas surveillés à chaud), puis `npm run build` avant de publier.
