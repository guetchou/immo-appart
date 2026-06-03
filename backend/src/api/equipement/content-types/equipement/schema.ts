export default {
  "kind": "collectionType",
  "collectionName": "equipements",
  "info": {
    "singularName": "equipement",
    "pluralName": "equipements",
    "displayName": "Equipement",
    "description": "Equipements administrables associables aux appartements"
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
    "icone": {
      "type": "string",
      "description": "Nom de l'icone Lucide React, ex: wifi, car, shield"
    },
    "categorie_ref": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::categorie-equipement.categorie-equipement",
      "inversedBy": "equipements"
    },
    "premium": {
      "type": "boolean",
      "default": false
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
      "relation": "manyToMany",
      "target": "api::appartement.appartement",
      "mappedBy": "equipements_ref"
    }
  }
} as const;
