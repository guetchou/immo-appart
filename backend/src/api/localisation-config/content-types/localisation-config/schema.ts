export default {
  kind: "singleType",
  collectionName: "localisation_config",
  info: {
    singularName: "localisation-config",
    pluralName: "localisation-configs",
    displayName: "Carte et localisation",
    description: "Textes et reglages administrables de la carte publique"
  },
  options: { draftAndPublish: false },
  attributes: {
    actif: { type: "boolean", default: true },
    section_id: { type: "string", default: "localisation" },
    surtitre: { type: "string", default: "Carte interactive" },
    titre: { type: "string", default: "Nos résidences à Pointe-Noire" },
    sous_titre: { type: "string", default: "Localisez les appartements · calculez votre trajet en temps réel" },
    ville_suffix: { type: "string", default: "Pointe-Noire" },
    centre_latitude: { type: "decimal", default: -4.7761 },
    centre_longitude: { type: "decimal", default: 11.8635 },
    zoom_initial: { type: "integer", default: 13 },
    zoom_position: { type: "integer", default: 14 },
    bouton_gps_idle: { type: "string", default: "Ma position GPS" },
    bouton_gps_loading: { type: "string", default: "Localisation…" },
    bouton_gps_done: { type: "string", default: "Position trouvée" },
    bouton_centrer: { type: "string", default: "Centrer" },
    plus_proche_label: { type: "string", default: "La plus proche" },
    position_popup: { type: "string", default: "Vous êtes ici" },
    erreur_gps: { type: "string", default: "Autorisation GPS refusée." },
    reserver_label: { type: "string", default: "Réserver" },
    prix_suffix: { type: "string", default: "XAF/nuit" },
    residence_marker_color: { type: "string", default: "#E07A2F" },
    user_marker_color: { type: "string", default: "#0369A1" },
    legend_residences_label: { type: "string", default: "Résidences NDOMBI" },
    legend_user_label: { type: "string", default: "Votre position" },
    attribution_label: { type: "string", default: "© OpenStreetMap contributors" }
  }
} as const;
