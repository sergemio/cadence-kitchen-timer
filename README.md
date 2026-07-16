# Kitchen Timers — Sezam&Co
> Last update: 2026-07-16
> 📦 Ce repo = **code du prototype webapp** du projet **Timer App** (hub de suivi : `P/topics/timer-app/README.md`). Terrain de prototypage UX avant le build **Flutter**.

App de minuteurs cuisine pour tablettes (Android + iPad, web app). Fichier unique : `index.html`.

## Décisions validées (12/07/2026)
- Voix en **anglais** (Web Speech API, en-US), phrase éditable par timer (défaut : "The {name} is ready")
- Après arrêt d'une alarme → le timer revient à sa durée initiale
- Hébergement cible : GitHub Pages (pas encore fait) ; v2 : sync Firebase
- Persistance : localStorage (`sezam-timers-v1` défs, `sezam-timers-run-v1` état en cours)

## Fonctionnalités v1
- CRUD timers (nom, durée, ringtone ×3 synthétisées WebAudio, phrase vocale)
- Grille auto-scale : les tuiles se redimensionnent pour que tout tienne sans scroll
- Tap = start ; tuile en cours : boutons −10s / +10s / ✕ (tap sur le corps ignoré, anti fausse manip)
- Alarme : ringtone + voix, répétition à ~7s puis fréquence croissante (gap ×0.72, min 2s), compteur de dépassement (+m:ss), pulsation rouge
- Mode Edit : wobble, tap = éditer, drag pointer-based = réordonner
- Timestamps (endsAt) → survit au reload / onglet en arrière-plan ; Wake Lock ; unlock audio au 1er tap ; vibration si supportée (Android oui, iPad non)

## Lancer en local
```
python -m http.server 8734 -d C:\Users\serge\Claude\topics\kitchen-timers
```
→ http://localhost:8734

## Design
Thème **light** (demandé par Serge) : fond papier chaud `#f5f1e8`, texte charbon, accent ember `#e8600f`. Fonts : Big Shoulders Display (titres/noms) + Chivo Mono (chiffres, tabular).

## Changelog
- 2026-07-12 — v1 initiale (single-file) thème light, servie en localhost
- 2026-07-12 — fix: overlay `#empty` (position:absolute inset:0) interceptait tous les clics sur les tuiles car `#empty{display:flex}` (spécificité #id) écrasait l'attribut `hidden`. Ajout `#empty[hidden]{display:none}` + `pointer-events:none`. Vérifié headless (idle→running au clic). + favicon inline (supprime 404).
- 2026-07-12 — batch retours Serge (tous vérifiés headless, 0 erreur) :
  - **Voix féminine** : `scoreVoice()` sélectionne une voix anglaise féminine par nom (Zira/Aria/Samantha…), évite les voix masculines (David/Mark…). Machine actuelle → Zira.
  - **File vocale** (`speechQueue`) : les annonces prennent leur tour au lieu de se couper ; arrêter un timer ne coupe que SA voix, pas celle d'un autre timer encore en train de sonner.
  - **Interaction timer actif** : tap simple = **pause/reprise** (statut `paused` : temps figé, anneau gris, respiration) ; **double-tap** = **reset**. Désambiguïsation via fenêtre 260 ms.
  - **Anneau** épaissi (`--ring-w:10px`, `--tile-r:20px`).
  - **Bouton ✕** écarté des ±10s (`margin-left:10cqw` ≈ 36px) + bordure rouge distinctive (anti fausse manip).
  - **Nom du plat** agrandi (11cqh → 14cqh) ; décompte reste dominant. Vérifié en capture (nom long « Chicken Shawarma » non tronqué).
- 2026-07-12 — **timers par défaut** (SEED_VERSION=2) = Fries 4:00 · Mozza/elastics 2:15 · Manoushe 0:45 · Crispy chicken 6:00 · Dough making 12:00 · Cooking chicken 6:00 · Donut 1:30. Bump SEED_VERSION = ré-applique la liste (remplace les timers existants une fois).
- 2026-07-12 — **PWA iPad/Android** : manifest.webmanifest (standalone, paysage), icônes PNG 180/192/512, service worker (`sw.js`, offline shell), meta iOS (apple-touch-icon, status-bar, title), theme-color, viewport-fit=cover + safe-area, anti-zoom/anti-callout, layout robuste au padding. Haptique : Android via Vibration API ; iOS via hack `<switch>` (best-effort, **non garanti** — iOS Safari n'a pas d'API Vibration). Vérifié headless (7 timers, manifest valide, SW enregistré, comportements OK, 0 erreur).
- 2026-07-16 — **[PROTO] Timers enchaînés multi-étapes** (contexte : projet d'app pro à publier sur stores avec Henry ; stack cible décidée = **Flutter**). Un timer peut porter plusieurs **phases** nommées ; chaque phase décompte, à chaque transition l'app **annonce vocalement la phase suivante** + son de transition (montée E5→B5) + flash orange + haptique ; la dernière phase déclenche l'alarme complète. Éditeur de steps dans la modale (toggle Single/Multi-step, add/remove, min:sec par phase). Pastille `i/n` + nom de phase sur la tuile ; anneau de progression **par phase**. Rattrapage après veille sans spam vocal. Exemple par défaut *Steak · med-rare* (Saisir A → Retourner/saisir B → Repos) ajouté en **non-destructif** (n'écrase PAS les timers existants ; flag `sezam-steak-demo-v1`). Tag de version `#ver` dans le header (aide au proto). SW cache `v3→v4`. Vérifié : syntaxe OK, 9/9 câblage, 16 assertions logiques (progression, timing, alarme finale, catch-up). **Absorbe l'idée cuisson** = presets calibrés par le chef (l'app répète SES phases/temps, n'invente aucun temps). **Pas encore poussé sur GitHub Pages** (attente OK Serge).
- 2026-07-16 — **[PROTO v2] Batch retours Serge** (testé local d'abord, cf. [[feedback_local-test-first-then-push]]) : **(1) i18n FR/EN** switchable via bouton header (défaut **FR**, persisté `sezam-lang`) — chrome traduit par attributs `data-i18n`/`data-i18n-ph` + fonction `tr()` (renommée pour éviter la collision avec la var `t`=timer), voix TTS suit la langue (`fr-FR`/`en-US`, voix féminine préférée), phrase par défaut + démo Steak localisés. **(2) Timers à étapes visuellement distincts** : cadre ember permanent (`inset box-shadow`) + **bandeau de phase proéminent** en haut (`⛓ 2/3 · Repos`) au lieu de la petite pastille. **(3) Progression « camembert »** : la tuile entière se remplit (conic-gradient plein depuis 12h) et se vide en révélant le fond `--track` — bien plus lisible que le fin contour ; couleur `--fill` mint→amber→red selon l'urgence ; idle = panneau plat (contraste avec les tuiles qui tournent). **(4) Boutons ±10s plus gros** (8cqh, min-width 26cqw, fond solide + ombre). Vérifié : syntaxe OK, 0 collision `t()`, 0 référence orpheline, câblage i18n+visuel complet. Tag `proto · steps v2`. **Toujours pas poussé** (attente validation visuelle Serge+Henry).
- 2026-07-16 — **[PROTO v3] Corrections retours Serge** (captures headless Edge à l'appui : `--headless=new --screenshot`, servi en local) : **(a)** bandeau de phase — retiré l'emoji ⛓ (glyphe cassé « 8 » en police mono) + restructuré en `pastille 2/3` + `nom de phase` qui **tronque proprement** (ellipsis) au lieu de déborder ; **(b)** démo Steak passée en **français** (« Saisir → Retourner → Repos », noms courts) via migration `demo-v2` qui remplace l'ancien démo anglais → la **voix parle enfin français** ; **(c)** champs **min/sec** du modal élargis (`5.5ch`) — « 00 » n'est plus coupé ; **(d)** **header responsive** (`@media 820/470px`) : masque version-tag / « kitchen » / horloge et réduit les boutons sur mobile → « + Nouveau » ne disparaît plus (vérifié capture 490px) ; **(e)** **drag-to-reorder réparé** — 2 bugs : `touch-action:none` sur tuiles en édition (le tactile volait le geste) **et** exclusion de la tuile déplacée du `elementFromPoint` (elle se retrouvait sous le doigt → aucune cible détectée → réorg impossible même à la souris) + handler `pointercancel`. SW cache `v4→v5`, tag `proto · steps v3`. Vérifié : syntaxe OK, câblage complet, captures header OK. **Poussé LIVE le 16/07** (commit `80d43e6`, GitHub Pages) après OK Serge.
- 2026-07-16 — **[PROTO v4] Nom d'étape allongé** : `maxlength` du champ nom de phase **16 → 60** (le champ était trop court, phrase de cuisson coupée à 3-4 mots — retour Serge screenshot). Permet ~8-10 mots (aligné sur le champ « annonce vocale ») → cue parlé plus riche à la transition. SW cache `v5→v6`, tag `proto · steps v4`. Poussé (commit `dbce9a2`).
- 2026-07-16 — **[PROTO v5] Ordre boutons ±10s inversé** (retour Serge) : `+10s` désormais **à gauche**, `−10s` à droite (ordre visuel dans `.tctl` ; `data-a` inchangés, logique identique). SW cache `v6→v7`, tag `proto · steps v5`. Poussé (commit `0238023`).
- 2026-07-16 — **[PROTO v6] Libellé FR raccourci** (retour Serge) : sous-texte tuile au repos « appuyer pour démarrer » → **« démarrer »** (FR uniquement ; EN « tap to start » inchangé). SW cache `v7→v8`, tag `proto · steps v6`. Poussé (commit `54055fb`).
- 2026-07-16 — **[PROTO v7] Couleur de tuile interpolée en continu** (retour Serge, inspiré du rendu de la landing page) : `fillFor(p)` ne renvoie plus 3 paliers (`mint`/`amber`/`red` qui snappent) mais **interpole la couleur en RGB en continu** selon la fraction restante `p` — mint `#5cc79a` → amber `#edb24e` → red `#ec6a6a`, ancres aux anciens seuils (ambre pur à p=0.35, rouge pur à p=0.15), continu aux jonctions. Recalculée à chaque tick (150 ms) → la tuile « se dégrade » doucement au fil du décompte. Vérifié : node (continuité 0.35/0.15 OK) + rendu visuel comparatif (continu vs paliers). SW cache `v8→v9`, tag `proto · steps v7`. **Testé local, PAS encore poussé** (attente OK Serge).

## Déploiement
GitHub Pages, repo `sergemio/sezam-timers` → https://sergemio.github.io/sezam-timers/
Pour mettre à jour : commit + push sur `main` (bumper `CACHE` dans `sw.js` à chaque changement pour forcer le refresh des clients).
