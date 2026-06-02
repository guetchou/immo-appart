export default {
  kind: "collectionType",
  collectionName: "publications_sociales",
  info: {
    singularName: "publication-sociale",
    pluralName: "publications-sociales",
    displayName: "Publication Sociale",
    description: "Posts réseaux sociaux affichés sur le site (TikTok, Instagram, YouTube, Facebook)"
  },
  options: { draftAndPublish: true },
  attributes: {
    reseau: {
      type: "enumeration",
      enum: ["tiktok", "instagram", "youtube", "facebook"],
      required: true
    },
    titre:        { type: "string",  required: true },
    description:  { type: "text"    },
    url_post:     { type: "string",  required: true,  description: "URL complète du post" },
    embed_url:    { type: "string",  description: "URL d'intégration (iframe src)" },
    miniature:    { type: "media",   multiple: false, allowedTypes: ["images"], description: "Vignette de la publication" },
    miniature_url:{ type: "string",  description: "URL de la miniature (alternative à media)" },
    vues:         { type: "integer", description: "Nombre de vues (à renseigner manuellement)" },
    date_publication: { type: "date" },
    ordre:        { type: "integer", default: 0, description: "Ordre d'affichage (plus élevé = en premier)" },
    actif:        { type: "boolean", default: true }
  }
} as const;
