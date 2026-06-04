export default {
  kind: "singleType",
  collectionName: "auth_espace_config",
  info: {
    singularName: "auth-espace-config",
    pluralName: "auth-espace-configs",
    displayName: "Authentification et espace client",
    description: "Textes publics administrables de connexion, inscription et espace client"
  },
  options: { draftAndPublish: false },
  attributes: {
    marque_nom: { type: "string", default: "Résidence NDOMBI" },
    marque_initiales: { type: "string", default: "RN" },
    marque_tagline: { type: "string", default: "Confort · Luxe · Élégance" },
    telephone_contact: { type: "string", default: "+242 06 435 90 90" },
    login_image_url: {
      type: "string",
      default: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&h=1200&fit=crop"
    },
    login_accroche_titre: { type: "string", default: "Votre espace" },
    login_accroche_accent: { type: "string", default: "privilégié" },
    login_accroche_texte: {
      type: "text",
      default: "Gérez vos réservations, consultez vos séjours passés et accédez à vos offres personnalisées."
    },
    login_avantages: {
      type: "json",
      default: [
        "Suivi de réservations en temps réel",
        "Accès prioritaire aux nouvelles résidences",
        "Offres exclusives membres"
      ]
    },
    login_retour_label: { type: "string", default: "Retour à l'accueil" },
    login_titre: { type: "string", default: "Bienvenue" },
    login_sous_titre: { type: "string", default: "Connectez-vous à votre espace Résidence NDOMBI" },
    login_email_label: { type: "string", default: "Adresse email" },
    login_email_placeholder: { type: "string", default: "votre@email.com" },
    login_password_label: { type: "string", default: "Mot de passe" },
    login_password_oublie_label: { type: "string", default: "Mot de passe oublié ?" },
    login_submit_label: { type: "string", default: "Se connecter" },
    login_loading_label: { type: "string", default: "Connexion…" },
    login_separator_label: { type: "string", default: "ou continuer avec" },
    login_no_account_label: { type: "string", default: "Pas encore de compte ?" },
    login_create_account_label: { type: "string", default: "Créer un compte" },
    inscription_image_url: {
      type: "string",
      default: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=900&h=1200&fit=crop"
    },
    inscription_accroche_titre: { type: "string", default: "Rejoignez" },
    inscription_accroche_accent: { type: "string", default: "l'expérience" },
    inscription_accroche_fin: { type: "string", default: "NDOMBI" },
    inscription_accroche_texte: {
      type: "text",
      default: "Créez votre compte et profitez d'un accès prioritaire à nos résidences de luxe à Pointe-Noire."
    },
    inscription_retour_label: { type: "string", default: "Déjà un compte ? Se connecter" },
    inscription_titre: { type: "string", default: "Créer un compte" },
    inscription_sous_titre: { type: "string", default: "Tous les champs marqués * sont obligatoires" },
    inscription_submit_label: { type: "string", default: "Créer mon compte" },
    inscription_loading_label: { type: "string", default: "Création…" },
    inscription_separator_label: { type: "string", default: "ou s'inscrire avec" },
    inscription_success_titre: { type: "string", default: "Compte créé !" },
    inscription_success_texte: { type: "string", default: "Votre compte a bien été créé." },
    inscription_success_cta: { type: "string", default: "Se connecter maintenant" },
    inscription_have_account_label: { type: "string", default: "Déjà un compte ?" },
    inscription_login_label: { type: "string", default: "Se connecter" },
    espace_titre_reservations: { type: "string", default: "Mes réservations" },
    espace_titre_favoris: { type: "string", default: "Mes favoris" },
    espace_titre_profil: { type: "string", default: "Mon profil" },
    espace_deconnexion_label: { type: "string", default: "Se déconnecter" },
    espace_empty_reservations_titre: { type: "string", default: "Aucune réservation" },
    espace_empty_reservations_texte: { type: "string", default: "Vos réservations apparaîtront ici." },
    espace_empty_reservations_cta: { type: "string", default: "Voir les appartements" },
    espace_empty_favoris_titre: { type: "string", default: "Aucun favori" },
    espace_empty_favoris_texte: { type: "string", default: "Cliquez sur le cœur d'une résidence pour la sauvegarder." },
    espace_empty_favoris_cta: { type: "string", default: "Explorer les résidences" },
    espace_profil_aide: { type: "string", default: "Pour modifier votre profil, contactez-nous sur WhatsApp." },
    espace_bonjour_label: { type: "string", default: "Bonjour" },
    espace_visiteur_label: { type: "string", default: "Visiteur" },
    espace_stat_reservations: { type: "string", default: "Réservations" },
    espace_stat_confirmees: { type: "string", default: "Confirmées" },
    espace_stat_favoris: { type: "string", default: "Favoris" },
    espace_loading_label: { type: "string", default: "Chargement…" },
    espace_voir_appartement_label: { type: "string", default: "Voir l'appartement" },
    espace_voir_label: { type: "string", default: "Voir" },
    espace_nom_utilisateur_label: { type: "string", default: "Nom d'utilisateur" },
    espace_email_label: { type: "string", default: "Adresse email" }
  }
} as const;
