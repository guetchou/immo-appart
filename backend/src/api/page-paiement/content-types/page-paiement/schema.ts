export default {
  kind: "singleType",
  collectionName: "page_paiement",
  info: {
    singularName: "page-paiement",
    pluralName: "pages-paiement",
    displayName: "Page Paiement",
    description: "Contenu administrable de la page Paiement"
  },
  options: { draftAndPublish: false },
  attributes: {
    label: { type: "string", default: "Facturation" },
    titre: { type: "string", default: "Modes de paiement" },
    introduction: { type: "text", default: "Nous acceptons tous les moyens de paiement adaptés au Congo Brazzaville." },
    modes: {
      type: "json",
      default: [
        { "name": "Airtel Money", "desc": "Envoi instantané depuis votre téléphone Airtel Congo. Numéro : +242 06 435 90 90", "color": "#E07A2F", "bg": "#FEF0E6" },
        { "name": "MTN MoMo", "desc": "Mobile Money MTN Congo. Envoi instantané, confirmation immédiate.", "color": "#CA8A04", "bg": "#FEF9E6" },
        { "name": "Espèces", "desc": "Paiement à l'arrivée ou en acompte sur rendez-vous. Reçu fourni.", "color": "#16A34A", "bg": "#DCFCE7" },
        { "name": "Virement bancaire", "desc": "Virement sur le compte de la Résidence NDOMBI. RIB communiqué sur demande.", "color": "#0369A1", "bg": "#DBEAFE" },
        { "name": "Chèque", "desc": "Chèque à l'ordre de Résidence NDOMBI. Remis 7 jours avant l'arrivée.", "color": "#7C3AED", "bg": "#F3E8FF" }
      ]
    },
    conditions_titre: { type: "string", default: "Conditions de paiement" },
    conditions: {
      type: "json",
      default: [
        { "label": "Acompte", "texte": "30% du montant total à la confirmation de réservation." },
        { "label": "Solde", "texte": "Le reste est réglé à l'arrivée avant la remise des clés." },
        { "label": "Caution", "texte": "Dépôt de garantie versé à l'arrivée, restitué dans les 48h après le départ." },
        { "label": "Reçu", "texte": "Un reçu numérique est envoyé par WhatsApp après chaque paiement." }
      ]
    }
  }
} as const;
