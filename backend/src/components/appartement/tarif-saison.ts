export default {
  "collectionName": "components_appartement_tarif_saisons",
  "info": {
    "displayName": "Tarif Saison",
    "icon": "calendar",
    "description": "Grille tarifaire saisonnière"
  },
  "options": {},
  "attributes": {
    "libelle": {
      "type": "string",
      "required": true,
      "description": "Ex: Haute saison, Fêtes de fin d'année, Basse saison"
    },
    "date_debut": {
      "type": "date",
      "required": true
    },
    "date_fin": {
      "type": "date",
      "required": true
    },
    "prix_nuit": {
      "type": "decimal",
      "required": true,
      "min": 0
    },
    "prix_semaine": {
      "type": "decimal",
      "min": 0,
      "description": "Prix forfaitaire 7 nuits (optionnel)"
    },
    "prix_weekend": {
      "type": "decimal",
      "min": 0,
      "description": "Prix vendredi + samedi ou sam + dim"
    },
    "duree_min_sejour": {
      "type": "integer",
      "min": 1,
      "default": 1,
      "description": "Nombre minimal de nuits pour cette période"
    },
    "actif": {
      "type": "boolean",
      "default": true
    }
  }
} as const;
