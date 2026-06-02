export default {
  kind: "singleType",
  collectionName: "footer_config",
  info: {
    singularName: "footer-config",
    pluralName: "footer-configs",
    displayName: "Footer",
    description: "Contenu du pied de page"
  },
  options: { draftAndPublish: false },
  attributes: {
    description:   { type: "text",   default: "Appartements meublés haut de gamme pour séjours courts et longs à Pointe-Noire. Une expérience unique alliant confort, luxe et service personnalisé." },
    adresse:       { type: "string", default: "Foucks, Pointe-Noire — près de la Clinique MOUAMBA, République du Congo" },
    email:         { type: "email",  default: "residencendombi@gmail.com" },
    telephone:     { type: "string", default: "+242 06 435 90 90" },
    copyright:     { type: "string", default: "Résidence NDOMBI — Tous droits réservés" },
    facebook_url:  { type: "string" },
    instagram_url: { type: "string" },
    youtube_url:   { type: "string" },
    whatsapp_url:  { type: "string", default: "https://wa.me/242064359090" },
    tiktok_url:    { type: "string", default: "https://www.tiktok.com/@rsidence.ndombi" },
  }
} as const;
