export default {
  "kind": "collectionType",
  "collectionName": "categories_services",
  "info": {
    "singularName": "categorie-service",
    "pluralName": "categories-services",
    "displayName": "Categorie Service",
    "description": "Categories administrables pour les services premium"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "nom": {
      "type": "string",
      "required": true,
      "maxLength": 80
    },
    "slug": {
      "type": "uid",
      "targetField": "nom",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "couleur": {
      "type": "string",
      "default": "#6B7280",
      "description": "Couleur principale au format hex, ex: #E07A2F"
    },
    "couleur_fond": {
      "type": "string",
      "default": "#F3F4F6",
      "description": "Couleur de fond au format hex, ex: #FEF0E6"
    },
    "ordre_affichage": {
      "type": "integer",
      "default": 0
    },
    "actif": {
      "type": "boolean",
      "default": true
    },
    "services": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::service-premium.service-premium",
      "mappedBy": "categorie_ref"
    }
  }
} as const;
