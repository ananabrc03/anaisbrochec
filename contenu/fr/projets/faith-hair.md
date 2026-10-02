---
id: faith-hair
ordre: 6
domaines: [web, conseil]
focus: "UX/UI · Développement web · Automatisation"
marche: "France"
resultats_cles: ["6 jours", "0", "Automatique", "2"]
titre: Faith Hair
intitule: Conceptrice & développeuse · application de réservation et de gestion
periode:
  affichage: "Septembre 2026 (du 10 au 15)"
  debut: 2026-09
  fin: 2026-09
categorie: Expérience professionnelle
cadre: Mission de création web · micro-entreprise
statut: livré
liens:
  - { libelle: "Voir l'application", url: "https://faith-hair.vercel.app" }
qualites_cles: [Q-ANL, Q-ADA, Q-REA]
qualites_secondaires: [Q-RIG]
familles_cles: [WEB, DES]
familles_secondaires: [STR, PRO]
sous_competences: [STR-6, DES-4, PRO-1, WEB-2, WEB-3, WEB-4]
---

# Faith Hair

## En-tête

- **Intitulé** : Conceptrice & développeuse · application de réservation et de gestion
- **Période** : septembre 2026, du 10 au 15
- **Résumé court** : Conception et développement, en six jours, d'une application de prise de rendez-vous et de gestion pour une coiffeuse spécialisée en tresses et coiffures afro. Elle remplace la gestion par messages Instagram : demandes complètes, prix calculé automatiquement, planning sans chevauchement.
- **Qualités clés** : `Q-ANL` Esprit d'analyse & de synthèse · `Q-ADA` Adaptabilité & apprentissage autodidacte · `Q-REA` Réactivité & sang-froid
- **Familles de compétences clés** : `WEB` Web, IA & automatisation · `DES` Design & direction artistique

## Mon rôle

- Identification du besoin et cartographie des prestations
- Conception de la solution et de l'expérience utilisateur (UX/UI, mobile d'abord)
- Développement front-end en HTML, CSS et JavaScript
- Back-end Supabase : modèle de données, sécurité, tâches planifiées
- Déploiement sur Vercel, code versionné sur GitHub

## Contexte

Faith Hair est une coiffeuse spécialisée en tresses et coiffures afro qui reprenait son activité. Elle prenait ses rendez-vous en messages privés sur Instagram et encaissait un acompte de 10 € via PayPal, suivi à la main.

Répondre aux clientes, ajuster le planning et vérifier les acomptes lui prenait tout son temps libre. Les demandes arrivaient souvent incomplètes ou peu claires, ce qui fragilisait la qualité des échanges, et le risque de rendez-vous qui se chevauchent était permanent.

**Avant** : rendez-vous en DM Instagram, acompte PayPal suivi à la main, demandes floues, planning difficile à tenir à jour.
**Après** : questionnaire guidé (prestation, créneau, coordonnées), prix et durée estimés automatiquement, planning en time blocking et suivi des réservations.

## Missions

### 1. Diagnostic & conception de la solution
- **Sous-compétences** : `STR-6` Diagnostic & recommandation stratégique · `PRO-1` Conception produit
- **Qualités** : `Q-ANL` Esprit d'analyse & de synthèse

J'ai commencé par identifier précisément le besoin, puis cartographier l'ensemble des prestations proposées, avec leurs durées, prix et suppléments. Cette cartographie a servi de base au questionnaire de réservation et au calcul automatique des prix. J'ai ensuite proposé une solution adaptée à sa situation : légère, sans serveur à maintenir, et modifiable par elle-même.

### 2. Une application à double interface
- **Sous-compétences** : `DES-4` UX/UI design & wireframing · `WEB-2` Création de sites & développement front · `WEB-4` Développement assisté par IA
- **Qualités** : `Q-ADA` Adaptabilité & apprentissage autodidacte · `Q-REA` Réactivité & sang-froid

**L'espace cliente** : un questionnaire guidé en quatre étapes, pensé mobile d'abord (accueil, prestation, créneau réellement disponible, coordonnées), puis un récapitulatif à envoyer sur Instagram. Les demandes arrivent complètes, suppléments compris, avec un prix calculé automatiquement.

**L'espace admin** : tout ce dont la coiffeuse a besoin au quotidien. Catalogue des prestations, suivi des réservations (CRM), disponibilités et réglages. Elle fait évoluer elle-même l'interface cliente au rythme de son activité, sans repasser par moi.

Application entièrement développée avec l'assistance de Claude Code.

::: media carrousel
- images/projets/faith-hair/faith-hair_01_espace-cliente.webp | L'espace cliente · un questionnaire guidé en 4 étapes
- images/projets/faith-hair/faith-hair_02_espace-admin.webp | L'espace admin · prestations, réservations, disponibilités, réglages
:::

### 3. Sous le capot
- **Sous-compétences** : `WEB-3` Back-end, données & automatisation · `WEB-4` Développement assisté par IA
- **Qualités** : `Q-RIG` Rigueur & exigence de qualité

Une architecture simple, sans serveur permanent à faire tourner :
- **Modèle Supabase** : 5 tables (prestations, réglages, horaires, exceptions, réservations) avec une sécurité stricte au niveau des lignes (RLS) : la cliente crée une demande, seule l'administratrice peut la lire et la modifier
- **Time blocking automatique** : durée et temps de battement recalculés à chaque choix ; seuls les rendez-vous confirmés bloquent réellement le planning
- **Tâches planifiées (pg_cron)** : archivage automatique des rendez-vous passés et purge de la corbeille après 7 jours, sans intervention manuelle

::: media image
- images/projets/faith-hair/faith-hair_03_stack-technique.webp | Stack & fonctionnement
:::

::: media icones-outils
- HTML / CSS / JavaScript
- Supabase
- Vercel
- GitHub
- Claude Code
:::

## Résultats & indicateurs clés

| Valeur | Libellé | Détail |
|---|---|---|
| 6 jours | du besoin à l'application en ligne | Du 10 au 15 septembre 2026 |
| 2 | interfaces | Espace cliente + espace admin |
| 0 | chevauchement de rendez-vous | Seuls les rendez-vous confirmés bloquent le planning |
| Automatique | calcul du prix et de la durée | Suppléments inclus, à chaque choix |
| 5 | tables Supabase sécurisées (RLS) | Archivage et purge automatiques |

