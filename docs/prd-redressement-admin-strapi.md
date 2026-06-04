# PRD - Redressement contenu administrable Strapi

## Problem Statement

Le site Residence NDOMBI est en production, mais une partie du contenu visible reste codee en dur dans le frontend Next.js. Cela oblige le proprietaire a repasser par le developpeur pour modifier des textes, libelles, options metier ou sections simples qui devraient etre gerees dans Strapi.

Les incidents recents ont aussi montre que les changements doivent etre faits avec une discipline de production stricte : audit avant action, sauvegarde quand donnees impliquees, migration non destructive, CI/CD, smoke tests, et rollback clair.

## Solution

Transformer progressivement le site en application administrable depuis Strapi, sans casser l'existant :

- Strapi devient la source de verite des contenus metier et editoriaux.
- Next.js garde la presentation, les composants, les regles d'affichage et les interactions.
- Les champs rigides sont remplaces par des single types ou collection types administrables.
- Les anciens champs restent temporairement en fallback pour eviter les pages cassees.
- Chaque tranche est livree avec migration non destructive, tests API, tests frontend et smoke production.

## User Stories

1. En tant que proprietaire, je veux modifier les textes du footer depuis Strapi, afin de ne pas demander une intervention developpeur pour une correction simple.
2. En tant que proprietaire, je veux modifier les liens sociaux depuis Strapi, afin de maintenir mes canaux officiels a jour.
3. En tant que proprietaire, je veux modifier le header et la navigation depuis Strapi, afin de garder un menu coherent sur toutes les pages.
4. En tant que proprietaire, je veux gerer les types de logement depuis Strapi, afin d'ajouter Studio, Villa, Duplex ou Autres sans redeployer.
5. En tant que proprietaire, je veux associer un appartement a un type de logement administrable, afin que les fiches restent coherentes.
6. En tant que proprietaire, je veux gerer les politiques d'annulation depuis Strapi, afin d'adapter les conditions commerciales.
7. En tant que proprietaire, je veux gerer les categories d'equipements depuis Strapi, afin de structurer les services visibles par les clients.
8. En tant que proprietaire, je veux gerer les equipements depuis Strapi, afin d'ajouter ou retirer un equipement sans code.
9. En tant que proprietaire, je veux gerer les categories de services premium depuis Strapi, afin d'ajuster l'offre commerciale.
10. En tant que proprietaire, je veux modifier la page A propos depuis Strapi, afin de corriger l'histoire, les valeurs et les contacts visibles.
11. En tant que proprietaire, je veux modifier la page Paiement depuis Strapi, afin de mettre a jour les moyens de paiement acceptes.
12. En tant que proprietaire, je veux modifier la page Reglement depuis Strapi, afin d'actualiser les regles de sejour.
13. En tant que proprietaire, je veux modifier la page Annulation depuis Strapi, afin de publier les politiques a jour.
14. En tant que visiteur, je veux voir un header identique sur toutes les pages, afin de naviguer sans confusion.
15. En tant que visiteur, je veux voir un footer coherent sur toutes les pages, afin d'avoir les memes informations de contact partout.
16. En tant que visiteur, je veux voir des contenus fiables et a jour, afin de reserver avec confiance.
17. En tant qu'administrateur Strapi, je veux que les options metier soient des collections administrables, afin de ne pas modifier les content types en production.
18. En tant que developpeur, je veux conserver des fallbacks frontend, afin qu'une donnee manquante dans Strapi ne casse pas une page publique.
19. En tant que developpeur, je veux que chaque changement Strapi ait une revalidation Next.js, afin que le site public se mette a jour proprement.
20. En tant qu'operateur production, je veux des checks reproductibles apres deploiement, afin de detecter rapidement une regression.

## Implementation Decisions

- Utiliser des single types Strapi pour les pages editoriales stables : A propos, Paiement, Reglement, configuration site, SEO global.
- Utiliser des collection types Strapi pour les listes evolutives : types de logement, equipements, categories, politiques d'annulation, FAQ, blocs de contenu repetables.
- Garder les anciens champs en fallback pendant la transition, puis les marquer comme legacy avant suppression future.
- Ne pas supprimer de donnees existantes sans dump DB et validation explicite.
- Ne pas modifier les content types directement en production. Les schemas sont modifies en developpement, commit/push, puis CI/CD deploie.
- Centraliser les appels Strapi dans une couche frontend unique, pour eviter les fetchs disperses et les contrats divergents.
- Centraliser header/footer dans des composants serveur partages, afin d'eviter les variantes par page.
- Ajouter les nouveaux modeles Strapi dans la route de revalidation.
- Conserver la presentation visuelle dans Next.js. Strapi gere le contenu, pas toute la logique UI.
- Pour les options qui influencent une logique de paiement ou de reservation, demander une tranche separee avec tests plus stricts.

## Plan De Livraison

### Phase 1 - Stabilisation deja livree

- Upload Strapi corrige pour eviter les erreurs HTML parsees en JSON.
- Header rendu coherent sur les pages.
- Footer rendu coherent et connecte a Strapi.
- Types de logement rendus administrables.
- Categories services, politiques d'annulation, categories equipements et equipements rendus administrables.
- Pages A propos, Paiement, Reglement et Annulation rendues administrables.

### Phase 2 - Audit des hardcodes restants

- Scanner frontend et backend pour contenus visibles non administrables.
- Classer chaque hardcode : contenu editorial, option metier, texte UI technique, logique applicative.
- Produire une matrice : garder en code, migrer en Strapi single type, migrer en collection type, ou transformer en composant partage.

### Phase 3 - Configuration globale site

- Creer un single type de configuration globale.
- Administrer : nom du site, slogan, telephone principal, email, adresse, WhatsApp, SEO par defaut, horaires, liens sociaux.
- Remplacer les usages disperses dans metadata, footer, pages contact et composants marketing.

### Phase 4 - Contenus commerciaux restants

- Rendre administrables les textes de home, sections de mise en avant, labels commerciaux, blocs de reassurance, FAQ et messages d'aide.
- Garder en code les libelles purement techniques ou les erreurs systeme.

### Phase 5 - Catalogue et detail logement

- Verifier les filtres, labels, et empty states.
- Rendre administrables les textes de presentation et options metier qui changent selon l'exploitation.
- Ne pas rendre administrable la logique de disponibilite sans cadrage metier separe.

### Phase 6 - Qualite production

- Ajouter des tests smoke API Strapi.
- Ajouter des tests Playwright sur les pages publiques critiques.
- Documenter le processus local -> push -> CI/CD -> verification production.
- Ajouter une checklist de rollback et de sauvegarde DB avant migration.

## Testing Decisions

- Tester les comportements visibles, pas les details internes.
- Pour chaque tranche : TypeScript backend, TypeScript frontend, build backend, CI GitHub, smoke HTTP production.
- Pour les pages publiques : verifier status 200, taille HTML non vide, titre attendu, absence d'erreur serveur dans logs.
- Pour Strapi : verifier que les endpoints API des nouveaux modeles repondent 200 avec token.
- Pour l'UI : Playwright screenshots sur desktop au minimum, puis mobile pour les pages a fort risque responsive.
- Pour les migrations : dry-run obligatoire, backup DB avant apply, puis verification idempotente.

## Out Of Scope

- Refonte graphique complete.
- Suppression immediate des anciens champs legacy.
- Modification destructive de la base de donnees.
- Refonte du tunnel de reservation ou du paiement.
- Internationalisation complete.
- Systeme de permissions Strapi avance par role metier.

## Risques Et Mitigations

- Risque : une donnee Strapi vide casse une page. Mitigation : fallbacks frontend conserves.
- Risque : changement schema Strapi incompatible production. Mitigation : CI backend + deploiement progressif + logs.
- Risque : contenu administrable trop libre et incoherent. Mitigation : schemas Strapi contraints, champs requis, descriptions claires.
- Risque : confusion entre contenu et logique metier. Mitigation : Strapi administre les donnees, Next.js conserve les regles.
- Risque : regression visuelle. Mitigation : screenshots Playwright et verification responsive.

## Definition Of Done

- Le contenu cible est modifiable dans Strapi.
- Le site public utilise la donnee Strapi avec fallback.
- Les anciennes donnees ne sont ni supprimees ni modifiees sans validation.
- Les tests TypeScript/build passent.
- Les workflows GitHub passent.
- La production est sur le commit attendu.
- Les endpoints publics critiques repondent 200.
- Les logs Strapi/Next ne montrent pas d'erreur nouvelle.
- Le rollback est documente.

## Notes

Le principe directeur est simple : tout ce qu'un proprietaire peut raisonnablement vouloir changer sans developpeur doit etre dans Strapi. Tout ce qui protege l'integrite du systeme, les calculs, les routes, les permissions, les paiements et la securite reste dans le code avec tests.
