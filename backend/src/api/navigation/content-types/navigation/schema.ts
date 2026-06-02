export default {
  kind: "singleType",
  collectionName: "navigation",
  info: {
    singularName: "navigation",
    pluralName: "navigations",
    displayName: "Navigation (Header)",
    description: "Contenu de la barre de navigation"
  },
  options: { draftAndPublish: false },
  attributes: {
    logo_nom:    { type: "string", default: "Résidence NDOMBI" },
    logo_tagline:{ type: "string", default: "Confort · Luxe · Élégance" },
    logo_image:  { type: "media",  multiple: false, allowedTypes: ["images"] },
    telephone:   { type: "string", default: "+242 06 435 90 90" },
    whatsapp:    { type: "string", default: "+242 06 435 90 90" },
    agent_nom:   { type: "string", default: "Agent NDOMBI" },
    agent_photo_url: {
      type: "string",
      default: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
    },
    agent_photo: { type: "media", multiple: false, allowedTypes: ["images"] },
    bouton_reserver_texte: { type: "string", default: "Réserver" },
    liens_nav: {
      type: "json",
      description: "Liens du menu principal — tableau [{label, href}]",
      default: [
        { "label": "Accueil",       "href": "/"             },
        { "label": "Appartements",  "href": "/appartements" },
        { "label": "Services",      "href": "/#services"    },
        { "label": "Avis",          "href": "/#temoignages" },
        { "label": "Contact",       "href": "/#contact"     }
      ]
    }
  }
} as const;
