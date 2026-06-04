export default {
  kind: "singleType",
  collectionName: "chat_config",
  info: {
    singularName: "chat-config",
    pluralName: "chat-configs",
    displayName: "ChatBot",
    description: "Messages et libelles administrables du ChatBot public"
  },
  options: { draftAndPublish: false },
  attributes: {
    actif: { type: "boolean", default: true },
    agent_nom: { type: "string", default: "Agent NDOMBI" },
    agent_statut: { type: "string", default: "En ligne · répond en <5 min" },
    agent_photo_url: {
      type: "string",
      default: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face"
    },
    message_accueil: {
      type: "text",
      default: "Bonjour ! Je suis l'assistant Résidence NDOMBI. Comment puis-je vous aider ?"
    },
    message_fallback: { type: "text", default: "Un agent vous répond sous peu." },
    message_reponse_libre: {
      type: "text",
      default: "Merci ! Un agent NDOMBI vous répondra très vite. Appelez aussi le ||+242 06 435 90 90||."
    },
    placeholder: { type: "string", default: "Votre message…" },
    fermer_label: { type: "string", default: "Fermer" },
    envoyer_label: { type: "string", default: "Envoyer" },
    ouvrir_label: { type: "string", default: "Chat" },
    reponses_rapides: {
      type: "json",
      description: "Boutons rapides [{label, reponse}] avec ||texte|| pour gras",
      default: [
        {
          "label": "Disponibilités",
          "reponse": "Consultez notre calendrier ou appelez le ||+242 06 435 90 90|| pour vérifier les disponibilités."
        },
        {
          "label": "Tarifs",
          "reponse": "Nos tarifs débutent à ||45 000 XAF / nuit|| selon le type de résidence et la saison."
        },
        {
          "label": "Réserver",
          "reponse": "Choisissez votre appartement, sélectionnez vos dates et remplissez le formulaire. Confirmation sous ||30 min|| !"
        },
        {
          "label": "Services",
          "reponse": "Navette aéroport, chef cuisinier, conciergerie, ménage quotidien et sécurité 24h/24."
        }
      ]
    }
  }
} as const;
