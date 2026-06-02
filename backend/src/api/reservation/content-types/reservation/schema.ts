export default {
  "kind": "collectionType",
  "collectionName": "reservations",
  "info": {
    "singularName": "reservation",
    "pluralName": "reservations",
    "displayName": "Réservation",
    "description": "Réservations clients avec suivi d'état et paiement"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "reference": {
      "type": "uid",
      "required": true,
      "description": "Code unique généré automatiquement (ex: RES-2025-00042)"
    },
    "statut": {
      "type": "enumeration",
      "enum": [
        "en_attente",
        "confirmee",
        "acompte_verse",
        "soldee",
        "annulee",
        "no_show"
      ],
      "default": "en_attente",
      "required": true
    },
    "date_arrivee": {
      "type": "date",
      "required": true
    },
    "date_depart": {
      "type": "date",
      "required": true
    },
    "nombre_nuits": {
      "type": "integer",
      "required": true,
      "min": 1
    },
    "nombre_personnes": {
      "type": "integer",
      "required": true,
      "min": 1
    },
    "prix_total": {
      "type": "decimal",
      "required": true,
      "min": 0
    },
    "caution_versee": {
      "type": "boolean",
      "default": false
    },
    "mode_paiement": {
      "type": "enumeration",
      "enum": [
        "espece",
        "airtel_money",
        "mtn_momo",
        "virement",
        "cheque"
      ],
      "required": true
    },
    "prenom_client": {
      "type": "string",
      "required": true
    },
    "nom_client": {
      "type": "string",
      "required": true
    },
    "email_client": {
      "type": "email",
      "required": true
    },
    "telephone_client": {
      "type": "string",
      "required": true
    },
    "whatsapp_client": {
      "type": "string",
      "description": "Numéro WhatsApp si différent du téléphone"
    },
    "type_client": {
      "type": "enumeration",
      "enum": [
        "particulier",
        "professionnel"
      ],
      "default": "particulier"
    },
    "nom_societe": {
      "type": "string",
      "description": "Visible uniquement si type_client = professionnel"
    },
    "nationalite": {
      "type": "string"
    },
    "piece_identite": {
      "type": "media",
      "multiple": false,
      "allowedTypes": [
        "images",
        "files"
      ],
      "description": "Scan CNI / Passeport / Permis"
    },
    "demandes_speciales": {
      "type": "text"
    },
    "notifications_envoyees": {
      "type": "json",
      "description": "Log des notifications {email, sms, whatsapp} envoyées"
    },
    "appartement": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::appartement.appartement",
      "inversedBy": "reservations"
    }
  }
} as const;
