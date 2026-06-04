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

Statut : catalogue et detail logement traites.

- Labels de filtres catalogue : migres vers `catalogue-config`.
- Titre et sous-titre catalogue : migres vers `catalogue-config`.
- Messages empty state et CTA catalogue : migres vers `catalogue-config`.
- Blocs de reassurance sur fiche appartement : migres vers `detail-appartement-config`.
- Labels, titres de sections, CTA, avis, galerie, horaires et appel de la fiche appartement : migres vers `detail-appartement-config`.

Decision probable :

- `catalogue-config` existe pour les textes, filtres rapides et tris.
- Garder la logique de filtrage dans Next.js.
- Relier davantage les filtres aux types de logement administrables si le proprietaire veut supprimer totalement les slugs legacy.
- La fiche detail consomme `detail-appartement-config`; les donnees logement restent dans `appartement`.

## Priorite 3 - ChatBot

Statut : traite.

- Message d'accueil, nom agent, statut, photo, quick replies, fallback, placeholder et labels sont migres vers `chat-config`.
- Le ChatBot est configurable sur accueil, catalogue et detail appartement.

Decision probable :

- `chat-config` existe.
- Garder la logique d'envoi locale tant qu'il ne s'agit pas d'un vrai chat connecte.
- Si besoin futur : creer un vrai flux conversationnel connecte a WhatsApp ou a une boite de reception.

## Priorite 4 - Tunnel reservation

Statut : partiellement traite avec `site-config`, mais a cadrer avant refonte.

- Textes UI du modal : fixes.
- Modes de paiement : logique metier et schema reservation encore rigides.
- Emails HTML : identite/contact migrent vers `site-config`; structure et donnees reservation restent code.

Decision probable :

- Ne pas rendre les modes de paiement libres sans revoir le schema reservation et les integrations paiement.
- Eventuellement creer une collection `mode-paiement` si le besoin metier est confirme.

## Priorite 5 - Authentification et espace client

Statut : traite pour les textes publics principaux.

- Textes login/inscription et messages d'aide : migres vers `auth-espace-config`.
- Libelles de profil, empty states et aide "contactez-nous WhatsApp" : migres vers `auth-espace-config`.
- Messages de validation, erreurs reseau et statuts metier reservation restent en code.

Decision probable :

- `auth-espace-config` existe.
- Garder validations, erreurs techniques et logique auth en code.

## Priorite 6 - Carte/localisation

Statut : traite pour la page d'accueil.

- Labels carte, titre, sous-titre, CTA, messages GPS, legende, couleurs de marqueurs et attribution : migres vers `localisation-config`.
- Coordonnees de centrage et niveaux de zoom : migres vers `localisation-config`.
- Pins residences : generes depuis les appartements qui possedent latitude/longitude.

Decision :

- `localisation-config` suffit tant que les pins correspondent aux appartements.
- Creer une collection `lieu-residence` uniquement si le proprietaire veut afficher des lieux non lies aux appartements.
