export default {
  kind: "singleType",
  collectionName: "homepage",
  info: {
    singularName: "homepage",
    pluralName: "homepages",
    displayName: "Page d'accueil",
    description: "Contenu éditorial de la page d'accueil"
  },
  options: { draftAndPublish: false },
  attributes: {
    // ── Hero ──────────────────────────────────────────
    hero_titre: {
      type: "string",
      required: true,
      default: "Réservez votre résidence à Pointe-Noire"
    },
    hero_sous_titre: {
      type: "text",
      default: "Appartements meublés haut de gamme · Confirmation WhatsApp en 30 min"
    },
    hero_image: {
      type: "media",
      multiple: false,
      allowedTypes: ["images"],
      description: "Image de fond du hero (recommandé : 1800×900px)"
    },
    hero_image_url_defaut: {
      type: "string",
      default: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1800&h=900&fit=crop"
    },
    // ── Stats bar ─────────────────────────────────────
    stat_residences: { type: "integer", default: 48 },
    stat_prix_min:   { type: "integer", default: 45000, description: "Prix minimum en XAF" },
    stat_note:       { type: "decimal", default: 4.9   },
    stat_confirmation: { type: "string", default: "< 30 min" },
    // ── Section Catalogue ─────────────────────────────
    catalogue_label: { type: "string", default: "Notre sélection" },
    catalogue_titre: { type: "string", default: "Appartements disponibles" },
    // ── Section Humain ────────────────────────────────
    humain_label:    { type: "string", default: "Recherche simplifiée" },
    humain_titre:    { type: "string", default: "Trouvez votre résidence idéale" },
    humain_texte:    { type: "text",   default: "Notre équipe vous accompagne à chaque étape — sélection, réservation, check-in et services." },
    humain_image:    { type: "media",  multiple: false, allowedTypes: ["images"] },
    humain_image_url_defaut: { type: "string", default: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=700&h=500&fit=crop&crop=top" },
    // ── Section Témoignages ───────────────────────────
    temoignages_label: { type: "string", default: "Avis clients vérifiés" },
    temoignages_titre: { type: "string", default: "Ce que disent nos résidents" },
    // ── Section Services ──────────────────────────────
    services_label:    { type: "string", default: "Services premium" },
    services_titre:    { type: "string", default: "Une expérience complète" },
    // ── Section Social Wall ───────────────────────────
    social_titre: { type: "string", default: "Suivez-nous" },
    social_sous_titre: { type: "text", default: "Retrouvez-nous sur les réseaux sociaux" },
    social_actif: { type: "boolean", default: true },
  }
} as const;
