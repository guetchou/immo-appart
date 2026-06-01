import type { Schema, Struct } from '@strapi/strapi';

export interface AppartementEquipement extends Struct.ComponentSchema {
  collectionName: 'components_appartement_equipements';
  info: {
    description: "\u00C9quipement ou commodit\u00E9 d'un appartement";
    displayName: 'Equipement';
    icon: 'puzzle-piece';
  };
  attributes: {
    categorie: Schema.Attribute.Enumeration<
      [
        'connectivite',
        'confort',
        'cuisine',
        'securite',
        'exterieur',
        'transport',
        'divertissement',
        'sante',
        'bebe',
        'accessibilite',
      ]
    > &
      Schema.Attribute.Required;
    icone: Schema.Attribute.String;
    nom: Schema.Attribute.String & Schema.Attribute.Required;
    premium: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

export interface AppartementTarifSaison extends Struct.ComponentSchema {
  collectionName: 'components_appartement_tarif_saisons';
  info: {
    description: 'Grille tarifaire saisonni\u00E8re';
    displayName: 'Tarif Saison';
    icon: 'calendar';
  };
  attributes: {
    actif: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    date_debut: Schema.Attribute.Date & Schema.Attribute.Required;
    date_fin: Schema.Attribute.Date & Schema.Attribute.Required;
    duree_min_sejour: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1>;
    libelle: Schema.Attribute.String & Schema.Attribute.Required;
    prix_nuit: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    prix_semaine: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
    prix_weekend: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'M\u00E9tadonn\u00E9es SEO partag\u00E9es';
    displayName: 'Seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaRobots: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'index, follow'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    structuredData: Schema.Attribute.JSON;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'appartement.equipement': AppartementEquipement;
      'appartement.tarif-saison': AppartementTarifSaison;
      'shared.seo': SharedSeo;
    }
  }
}
