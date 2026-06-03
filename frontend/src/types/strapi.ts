// ── Strapi 5 response wrappers ────────────────────────
export type StrapiList<T>   = { data: T[]; meta: StrapiMeta }
export type StrapiSingle<T> = { data: T }
export type StrapiMeta      = { pagination: { page: number; pageSize: number; pageCount: number; total: number } }

export type StrapiMedia = {
  id: number
  documentId: string
  url: string
  alternativeText: string | null
  width: number
  height: number
  formats?: { thumbnail?: StrapiMediaFormat; small?: StrapiMediaFormat; medium?: StrapiMediaFormat; large?: StrapiMediaFormat }
}
type StrapiMediaFormat = { url: string; width: number; height: number }

// ── Appartement ──────────────────────────────────────
export type Appartement = {
  id: number
  documentId: string
  titre: string
  slug: string
  description_courte: string
  description: string
  type_logement: string | null
  type_logement_ref?: {
    id: number
    documentId: string
    nom: string
    slug: string
    description_simple?: string | null
  } | null
  statut: 'disponible' | 'occupe' | 'maintenance' | 'inactif'
  en_vedette: boolean
  nouveau: boolean
  prix_nuit_base: number
  devise: 'XAF' | 'USD' | 'EUR' | 'CDF'
  caution: number | null
  duree_min_sejour: number
  capacite_personnes: number
  nombre_chambres: number
  nombre_salles_bain: number
  superficie: number | null
  etage: number | null
  adresse: string
  quartier: string
  ville: string
  pays: string
  latitude: number
  longitude: number
  note_moyenne: number | null
  nombre_avis: number
  heure_checkin: string
  heure_checkout: string
  image_principale: StrapiMedia
  galerie: StrapiMedia[]
  video_url: string | null
  visite_3d_url: string | null
  politique_annulation: 'flexible' | 'moderee' | 'stricte' | 'non_remboursable'
  ordre_affichage: number | null
}

// ── Réservation ──────────────────────────────────────
export type ReservationCreate = {
  date_arrivee: string
  date_depart: string
  nombre_nuits: number
  nombre_personnes: number
  prix_total: number
  mode_paiement: 'espece' | 'airtel_money' | 'mtn_momo' | 'virement' | 'cheque'
  prenom_client: string
  nom_client: string
  email_client: string
  telephone_client: string
  whatsapp_client?: string
  type_client: 'particulier' | 'professionnel'
  nom_societe?: string
  nationalite?: string
  demandes_speciales?: string
  appartement: { connect: [{ id: number }] }
}

export type Reservation = ReservationCreate & {
  id: number
  documentId: string
  reference: string
  statut: 'en_attente' | 'confirmee' | 'acompte_verse' | 'soldee' | 'annulee' | 'no_show'
}

// ── Avis ─────────────────────────────────────────────
export type Avis = {
  id: number
  documentId: string
  prenom_auteur: string
  initiale_nom: string | null
  nationalite: string | null
  note_globale: number
  note_proprete: number | null
  note_communication: number | null
  note_emplacement: number | null
  commentaire: string
  date_sejour: string | null
  verifie: boolean
}
