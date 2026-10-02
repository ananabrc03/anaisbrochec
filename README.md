# Portfolio AB

Portfolio bilingue d’Anaïs Brochec. Astro génère les pages HTML à l’avance ; le navigateur charge seulement les interactions nécessaires.

## Où modifier quoi ?

| Modification | Fichier ou dossier |
| --- | --- |
| Textes français / anglais des pages | contenu/i18n/fr.json et en.json |
| Texte d’un projet, missions et liens | contenu/fr/projets/ et contenu/en/projets/ |
| Compétences et liens vers les projets | contenu/competences.json |
| Parcours | contenu/timeline.json |
| Outils, icônes et projets associés | contenu/outils.json |
| Disposition de l’accueil | src/vues/Accueil.astro |
| Disposition des autres pages | src/vues/APropos.astro, Projets.astro, Projet.astro, CV.astro |
| Couleurs, tailles et mobile | src/styles/global.css |
| Menu et pied de page | src/layouts/Base.astro |
| Animations et interactions | src/scripts/public.ts |
| Images et icônes | public/images/ |
| Portraits | public/media/photos/ |
| Les douze CV PDF | public/cv/ |

Un fichier .astro ressemble à du HTML. La partie entre les deux lignes --- prépare ses données ; la partie en dessous décrit la page. Les éléments communs (cartes, galeries, compétences) sont dans src/components. Le fichier src/pages/[...slug].astro associe automatiquement les adresses françaises et anglaises aux vues.

Les fichiers de contenu font partie du fonctionnement du site. Il n’y a pas de document éditorial séparé. Les identifiants des compétences, projets et outils servent aux liens : conservez-les lorsque vous modifiez un titre.

## Consulter et modifier en local

Sur Windows, double-cliquer sur « Lancer le portfolio.cmd ». La première ouverture installe les outils nécessaires. Garder la fenêtre ouverte pendant la consultation.

Pour utiliser un terminal, avec Node.js installé, lancer une première fois : pnpm install

Puis : pnpm dev

Ouvrir http://127.0.0.1:4321. Les modifications apparaissent automatiquement. La commande pnpm check vérifie le code ; pnpm build vérifie les contenus et génère le site.

## GitHub

Le ZIP Portfolio AB contient les sources utiles et les médias. Décompressez-le puis ajoutez le dossier au dépôt avec GitHub Desktop : le nombre de fichiers n’est alors pas limité par le formulaire d’envoi du navigateur. Le fichier .gitignore exclut automatiquement les dépendances, les fichiers générés et la configuration locale.

## Publication

Réglages du projet existant : framework Astro, pnpm build, dossier de sortie dist. Conservez les variables PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_ADMIN_EMAIL et PUBLIC_SITE_URL déjà utilisées. PUBLIC_SITE_URL correspond à l’adresse publique du site. Le fichier .env.example indique les variables attendues ; .env reste local et ne figure pas dans le ZIP.

Le contact, l’administration et les statistiques utilisent les services existants. Le dossier supabase conserve la fonction de contact ; une simple modification de présentation ne nécessite pas de la redéployer.
