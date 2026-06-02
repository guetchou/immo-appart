export default {
  kind: "singleType",
  collectionName: "reseaux_sociaux",
  info: {
    singularName: "reseaux-sociaux",
    pluralName: "reseaux-sociaux-list",
    displayName: "Réseaux Sociaux",
    description: "URLs et activation des réseaux sociaux"
  },
  options: { draftAndPublish: false },
  attributes: {
    tiktok_url:       { type: "string", default: "https://www.tiktok.com/@rsidence.ndombi" },
    tiktok_actif:     { type: "boolean", default: true  },
    instagram_url:    { type: "string"  },
    instagram_actif:  { type: "boolean", default: false },
    facebook_url:     { type: "string"  },
    facebook_actif:   { type: "boolean", default: false },
    youtube_url:      { type: "string"  },
    youtube_actif:    { type: "boolean", default: false },
    whatsapp_numero:  { type: "string", default: "+242064359090" },
    whatsapp_actif:   { type: "boolean", default: true  },
  }
} as const;
