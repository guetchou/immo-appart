export default {
  "kind": "collectionType",
  "collectionName": "politiques_annulation",
  "info": {
    "singularName": "politique-annulation",
    "pluralName": "politiques-annulation",
    "displayName": "Politique d'annulation",
    "description": "Politiques d'annulation administrables pour les appartements"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "nom": {
      "type": "string",
      "required": true,
      "maxLength": 120
    },
    "slug": {
      "type": "uid",
      "targetField": "nom",
      "required": true
    },
    "description_simple": {
      "type": "text",
      "maxLength": 300
    },
    "details": {
      "type": "richtext"
    },
    "ordre_affichage": {
      "type": "integer",
      "default": 0
    },
    "actif": {
      "type": "boolean",
      "default": true
    },
    "appartements": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::appartement.appartement",
      "mappedBy": "politique_annulation_ref"
    }
  }
} as const;
