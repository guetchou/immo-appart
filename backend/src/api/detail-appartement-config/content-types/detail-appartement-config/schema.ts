export default {
  kind: "singleType",
  collectionName: "detail_appartement_config",
  info: {
    singularName: "detail-appartement-config",
    pluralName: "detail-appartement-configs",
    displayName: "Fiche appartement",
    description: "Textes et libelles administrables des fiches appartement"
  },
  options: { draftAndPublish: false },
  attributes: {
    retour_label: { type: "string", default: "Retour aux appartements" },
    photo_precedente_label: { type: "string", default: "Photo précédente" },
    photo_suivante_label: { type: "string", default: "Photo suivante" },
    aucune_photo_label: { type: "string", default: "Aucune photo" },
    avis_label: { type: "string", default: "avis" },
    caracteristiques: {
      type: "json",
      description: "Labels des caracteristiques {type,chambres,sdb,personnes,superficie}",
      default: {
        "type": "Type",
        "chambres": "Chambres",
        "sdb": "Sdb",
        "personnes": "Personnes",
        "superficie": "Superficie"
      }
    },
    description_titre: { type: "string", default: "Description" },
    equipements_titre: { type: "string", default: "Équipements" },
    premium_label: { type: "string", default: "Premium" },
    horaires_titre: { type: "string", default: "Horaires" },
    checkin_label: { type: "string", default: "Check-in :" },
    checkout_label: { type: "string", default: "Check-out :" },
    politique_titre: { type: "string", default: "Politique d'annulation" },
    visite_video_titre: { type: "string", default: "Visite vidéo" },
    video_tiktok_titre: { type: "string", default: "Vidéo TikTok" },
    video_titre: { type: "string", default: "Vidéo" },
    avis_titre: { type: "string", default: "Avis clients" },
    laisser_avis_label: { type: "string", default: "Laisser un avis" },
    nuit_label: { type: "string", default: "nuit" },
    reserver_cta: { type: "string", default: "Réserver maintenant" },
    appeler_label: { type: "string", default: "Appeler" },
    reassurance_items: {
      type: "json",
      description: "Liste de reassurance affichee sous le CTA",
      default: [
        "Confirmation WhatsApp sous 30 min",
        "Paiement sur place — Airtel · MTN · Espèces",
        "Annulation selon politique ci-dessus"
      ]
    }
  }
} as const;
