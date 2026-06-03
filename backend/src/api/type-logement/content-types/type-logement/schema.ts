export default {
  kind: "collectionType",
  collectionName: "types_logement",
  info: {
    singularName: "type-logement",
    pluralName: "types-logement",
    displayName: "Type de logement",
    description: "Types de biens administrables affiches sur le site"
  },
  options: {
    draftAndPublish: true
  },
  attributes: {
    nom: {
      type: "string",
      required: true,
      maxLength: 120
    },
    slug: {
      type: "uid",
      targetField: "nom",
      required: true
    },
    description_simple: {
      type: "text",
      maxLength: 300,
      description: "Description courte affichee ou utilisee en aide admin"
    },
    ordre_affichage: {
      type: "integer",
      default: 0
    },
    actif: {
      type: "boolean",
      default: true
    },
    appartements: {
      type: "relation",
      relation: "oneToMany",
      target: "api::appartement.appartement",
      mappedBy: "type_logement_ref"
    }
  }
} as const;
