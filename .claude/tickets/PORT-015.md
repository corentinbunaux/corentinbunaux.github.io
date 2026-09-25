---
id: PORT-015
title: "Zone ⑦ Footer réel + polish responsive"
group: corentin
machine: asus_corentin
milestone: M3 — Contenu & structure
status: draft
resumeAt: null
priority: P1
estimate: 1.0
confidence: medium
depends_on: [PORT-008]
parallel_safe: true
human_checkpoint: "Cliquer chaque lien du footer (mailto, LinkedIn, GitHub, CV) et confirmer qu'ils fonctionnent"
created: 2026-09-26
---

# Zone ⑦ Footer réel + polish responsive

**Contexte** — Zone ⑦ de la maquette "REFONTE". Le footer actuel
(`footer.jsx`) est minimal : 3 liens + année en dur, pas de CV, pas de nav.

**⚠️ Bloquant partiel** — comme PORT-009, ce ticket a besoin d'un PDF de CV à
lier. À confirmer/fournir avant `/ticket`.

**Livrable** — Un vrai footer : bloc contact, lien CV PDF, liens de nav,
liens sociaux, mention d'année dynamique.

**Critères d'acceptation**
- [ ] Bloc "Travaillons ensemble" avec CTA contact (mailto
      `corentin.bunaux@gmail.com`) et téléchargement du CV.
- [ ] Colonnes de nav (Profil/Parcours/Projets/À propos, Safran/Quimesis/SNCF/
      CCTV, Contact) reprenant la structure de la maquette.
- [ ] Année affichée dynamiquement (plus de "2025" en dur).
- [ ] Responsive vérifié sur mobile (colonne unique).
