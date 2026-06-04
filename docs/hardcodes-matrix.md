# Matrice des contenus hardcodes restants

Date audit : 2026-06-04

## Regle de classement

- Migrer vers Strapi : contenu que le proprietaire peut modifier sans developpeur.
- Garder en code : logique de securite, paiement, validation, routes, calculs, erreurs techniques.
- Garder en fallback : texte de secours quand Strapi est indisponible ou incomplet.

## Priorite 1 - Identite globale et contact

Statut : tranche en cours.

- SEO global du layout : migrer vers `site-config`.
- Nom du site, slogan, adresse, telephone, WhatsApp, emails : migrer vers `site-config`.
- Emails de reservation : utiliser `site-config` pour nom/adresse/telephone/delai de confirmation.
- Revalidation : ajouter `site-config`.

## Priorite 2 - Catalogue et detail logement

Statut : a traiter ensuite.

- Labels de filtres catalogue : certains restent fixes dans le frontend.
- Titre et sous-titre catalogue : partiellement hardcodes.
- Messages empty state et CTA : fixes.
- Blocs de reassurance sur fiche appartement : fixes.

Decision probable :

- Creer un single type `catalogue-config`.
- Garder la logique de filtrage dans Next.js.
- Relier les filtres aux types de logement administrables quand c'est possible.

## Priorite 3 - ChatBot

Statut : a traiter ensuite.

- Message d'accueil, nom agent, delai de reponse, quick replies et telephone sont fixes.
- L'image agent est deja administrable via navigation, mais le composant ne consomme pas encore ces donnees.

Decision probable :

- Creer un single type `chat-config`.
- Passer la configuration aux composants clients qui affichent le ChatBot.
- Garder la logique d'envoi locale tant qu'il ne s'agit pas d'un vrai chat connecte.

## Priorite 4 - Tunnel reservation

Statut : partiellement traite avec `site-config`, mais a cadrer avant refonte.

- Textes UI du modal : fixes.
- Modes de paiement : logique metier et schema reservation encore rigides.
- Emails HTML : identite/contact migrent vers `site-config`; structure et donnees reservation restent code.

Decision probable :

- Ne pas rendre les modes de paiement libres sans revoir le schema reservation et les integrations paiement.
- Eventuellement creer une collection `mode-paiement` si le besoin metier est confirme.

## Priorite 5 - Authentification et espace client

Statut : a traiter plus tard.

- Textes login/inscription et messages d'aide : fixes.
- Libelles de profil et messages "contactez-nous WhatsApp" : fixes.

Decision probable :

- Migrer uniquement les textes marketing/aide.
- Garder validations, erreurs techniques et logique auth en code.

## Priorite 6 - Carte/localisation

Statut : a traiter plus tard.

- Labels carte et titre "Residences NDOMBI" : fixes.
- Coordonnees et pins peuvent etre administrables si plusieurs residences sont prevues.

Decision probable :

- Creer une collection `lieu-residence` si le proprietaire gere plusieurs lieux.
- Sinon garder la carte en code avec contact global dans `site-config`.
