export default {
  kind: "singleType",
  collectionName: "catalogue_config",
  info: {
    singularName: "catalogue-config",
    pluralName: "catalogue-configs",
    displayName: "Configuration catalogue",
    description: "Textes, filtres et libelles administrables de la page catalogue"
  },
  options: { draftAndPublish: false },
  attributes: {
    meta_titre: { type: "string", default: "Appartements disponibles" },
    meta_description: {
      type: "text",
      default: "Découvrez notre sélection de résidences de luxe à Pointe-Noire — studios, T2/T3, penthouses et villas."
    },
    surtitre: { type: "string", default: "Nos résidences" },
    titre: { type: "string", default: "Appartements disponibles" },
    sous_titre: { type: "string", default: "Foucks & environs · Pointe-Noire, République du Congo" },
    recherche_placeholder: { type: "string", default: "Quartier, nom…" },
    filtres_label: { type: "string", default: "Filtres" },
    effacer_label: { type: "string", default: "Effacer" },
    resultat_singulier: { type: "string", default: "résidence" },
    resultat_pluriel: { type: "string", default: "résidences" },
    budget_label: { type: "string", default: "Budget / nuit (XAF)" },
    prix_min_placeholder: { type: "string", default: "Min" },
    prix_max_placeholder: { type: "string", default: "Max" },
    dates_label: { type: "string", default: "Dates de séjour" },
    voyageurs_label: { type: "string", default: "Voyageurs" },
    empty_titre_aucun_bien: { type: "string", default: "Aucun appartement disponible pour le moment" },
    empty_texte_aucun_bien: { type: "text", default: "Revenez bientôt — nos résidences seront publiées prochainement." },
    empty_titre_aucun_resultat: { type: "string", default: "Aucun résultat" },
    empty_texte_aucun_resultat: { type: "text", default: "Modifiez vos critères pour voir plus de résidences." },
    empty_cta: { type: "string", default: "Effacer les filtres" },
    badge_en_vedette: { type: "string", default: "En vedette" },
    badge_nouveau: { type: "string", default: "Nouveau" },
    detail_cta: { type: "string", default: "Détail" },
    reserver_cta: { type: "string", default: "Réserver" },
    chips_type: {
      type: "json",
      description: "Filtres rapides [{label, types:[slugs legacy ou type-logement]}]",
      default: [
        { "label": "Tous", "types": [] },
        { "label": "Studios", "types": ["studio"] },
        { "label": "Appart. 1-2 ch.", "types": ["appartement-1-chambre", "appartement-2-chambres", "t1", "t2"] },
        { "label": "Appart. 3+ ch.", "types": ["appartement-3-chambres", "appartement-4-chambres", "appartement-4-chambres-et-plus", "t3", "t4", "t5_plus"] },
        { "label": "Villas", "types": ["villa", "villa-2-chambres", "villa-3-chambres", "villa-4-chambres-et-plus"] },
        { "label": "Duplex + autres", "types": ["duplex", "loft", "autres"] }
      ]
    },
    tris: {
      type: "json",
      description: "Options de tri [{value,label}] - value doit rester parmi ordre, prix_asc, prix_desc, note, nouveau",
      default: [
        { "value": "ordre", "label": "Recommandés" },
        { "value": "prix_asc", "label": "Prix croissant" },
        { "value": "prix_desc", "label": "Prix décroissant" },
        { "value": "note", "label": "Mieux notés" },
        { "value": "nouveau", "label": "Nouveautés" }
      ]
    }
  }
} as const;
