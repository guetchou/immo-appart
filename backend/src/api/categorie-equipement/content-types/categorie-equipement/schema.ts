export default {
  "kind": "collectionType",
  "collectionName": "categories_equipements",
  "info": {
    "singularName": "categorie-equipement",
    "pluralName": "categories-equipements",
    "displayName": "Categorie Equipement",
    "description": "Categories administrables pour classer les equipements"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "nom": {
      "type": "string",
      "required": true,
      "maxLength": 100
    },
    "slug": {
      "type": "uid",
      "targetField": "nom",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "ordre_affichage": {
      "type": "integer",
      "default": 0
    },
    "actif": {
      "type": "boolean",
      "default": true
    },
    "equipements": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::equipement.equipement",
      "mappedBy": "categorie_ref"
    }
  }
} as const;
