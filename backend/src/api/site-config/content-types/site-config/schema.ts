export default {
  kind: "singleType",
  collectionName: "site_config",
  info: {
    singularName: "site-config",
    pluralName: "site-configs",
    displayName: "Configuration globale du site",
    description: "Identite, contact et SEO global utilises par le site public"
  },
  options: { draftAndPublish: false },
  attributes: {
    nom_site: { type: "string", default: "Résidence NDOMBI", required: true },
    slogan: { type: "string", default: "Confort · Luxe · Élégance" },
    titre_seo_defaut: {
      type: "string",
      default: "Résidence NDOMBI — Appartements de luxe à Pointe-Noire"
    },
    template_titre_seo: {
      type: "string",
      default: "%s | Résidence NDOMBI",
      description: "Template Next.js pour les titres de pages"
    },
    description_seo: {
      type: "text",
      default: "Appartements meublés haut de gamme à Foucks, Pointe-Noire. Studios, T2/T3, Penthouse et Villas. Confort · Luxe · Élégance."
    },
    mots_cles_seo: {
      type: "json",
      description: "Tableau de mots-cles SEO",
      default: ["appartement", "luxe", "Pointe-Noire", "Congo", "location", "résidence", "NDOMBI"]
    },
    open_graph_description: {
      type: "text",
      default: "Appartements meublés haut de gamme à Pointe-Noire, République du Congo."
    },
    adresse: {
      type: "string",
      default: "Foucks, Pointe-Noire, République du Congo"
    },
    telephone_principal: { type: "string", default: "+242 06 435 90 90" },
    whatsapp_principal: { type: "string", default: "+242 06 435 90 90" },
    email_contact: { type: "email", default: "residencendombi@gmail.com" },
    email_reservations: {
      type: "email",
      default: "residencendombi@gmail.com",
      description: "Adresse proprietaire qui recoit les nouvelles reservations"
    },
    email_expediteur: {
      type: "email",
      default: "reservations@residencendombi.cg",
      description: "Adresse expediteur utilisee si aucune variable FROM_EMAIL n'est definie"
    },
    delai_confirmation: {
      type: "string",
      default: "30 minutes",
      description: "Texte affiche dans les confirmations de reservation"
    }
  }
} as const;
