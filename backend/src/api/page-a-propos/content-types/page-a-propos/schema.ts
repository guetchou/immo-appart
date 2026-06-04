export default {
  kind: "singleType",
  collectionName: "page_a_propos",
  info: {
    singularName: "page-a-propos",
    pluralName: "pages-a-propos",
    displayName: "Page A propos",
    description: "Contenu administrable de la page A propos"
  },
  options: { draftAndPublish: false },
  attributes: {
    hero_label: { type: "string", default: "Notre histoire" },
    hero_titre: { type: "string", default: "Résidence NDOMBI" },
    hero_texte: { type: "text", default: "Appartements meublés haut de gamme à Foucks, Pointe-Noire — République du Congo." },
    mission_titre: { type: "string", default: "Notre mission" },
    mission_texte: { type: "richtext", default: "La Résidence NDOMBI propose des appartements meublés entièrement équipés pour des séjours professionnels ou familiaux à Pointe-Noire. Nous offrons un service personnalisé, une confirmation rapide et des prestations hôtelières sans les contraintes d'un grand hôtel." },
    points_titre: { type: "string", default: "Ce qui nous distingue" },
    points_forts: {
      type: "json",
      default: [
        "Confirmation WhatsApp en moins de 30 minutes",
        "Paiement Airtel Money, MTN MoMo, espèces ou virement",
        "Services premium : navette, chef cuisinier, conciergerie",
        "Appartements entièrement meublés et équipés",
        "Sécurité 24h/24 et parking sécurisé",
        "Idéalement situé à Foucks, proche de la Clinique MOUAMBA"
      ]
    },
    contact_titre: { type: "string", default: "Nous contacter" },
    contact_items: {
      type: "json",
      default: [
        { "type": "adresse", "texte": "Foucks, non loin de la Clinique MOUAMBA, Pointe-Noire, République du Congo" },
        { "type": "telephone", "texte": "+242 06 435 90 90" },
        { "type": "email", "texte": "residencendombi@gmail.com" }
      ]
    }
  }
} as const;
