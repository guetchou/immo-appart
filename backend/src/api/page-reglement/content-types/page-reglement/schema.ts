export default {
  kind: "singleType",
  collectionName: "page_reglement",
  info: {
    singularName: "page-reglement",
    pluralName: "pages-reglement",
    displayName: "Page Reglement",
    description: "Contenu administrable de la page Reglement interieur"
  },
  options: { draftAndPublish: false },
  attributes: {
    label: { type: "string", default: "Votre séjour" },
    titre: { type: "string", default: "Règlement intérieur" },
    introduction: { type: "text", default: "Ces règles garantissent un séjour agréable pour tous les résidents." },
    sections: {
      type: "json",
      default: [
        { "title": "Horaires", "items": ["Check-in : à partir de 14h00", "Check-out : avant 11h00", "Arrivée tardive (après 21h) : prévenir 24h à l'avance"] },
        { "title": "Occupants", "items": ["Seuls les voyageurs déclarés lors de la réservation sont autorisés", "Toute personne supplémentaire doit être signalée", "Interdiction de sous-louer ou céder le logement"] },
        { "title": "Bruit & voisinage", "items": ["Silence de 22h à 7h", "Musique à volume modéré uniquement", "Fêtes et rassemblements interdits sans accord préalable"] },
        { "title": "Tabac & animaux", "items": ["Logements strictement non-fumeurs (y compris les balcons)", "Animaux de compagnie non acceptés (sauf accord écrit)"] },
        { "title": "Entretien", "items": ["Laisser l'appartement dans l'état d'origine", "Signaler immédiatement tout dommage ou dysfonctionnement", "La vaisselle doit être lavée avant le départ", "Les poubelles doivent être sorties"] },
        { "title": "Sécurité", "items": ["Ne pas remettre les clés à des tiers", "Fermer à clé en quittant l'appartement", "Signaler toute personne suspecte à la réception"] }
      ]
    },
    note: { type: "text", default: "Tout manquement grave peut entraîner l'interruption du séjour sans remboursement." }
  }
} as const;
