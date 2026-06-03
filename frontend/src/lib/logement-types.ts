export type TypeLogementRef = {
  nom?: string | null
  slug?: string | null
  description_simple?: string | null
}

export const LEGACY_TYPE_LABELS: Record<string, string> = {
  studio: 'Studio',
  t1: 'Appartement 1 chambre',
  t2: 'Appartement 2 chambres',
  t3: 'Appartement 3 chambres',
  t4: 'Appartement 4 chambres',
  t5_plus: 'Appartement 4 chambres et plus',
  villa: 'Villa',
  penthouse: 'Penthouse',
  duplex: 'Duplex',
  loft: 'Loft',
}

export function logementTypeKey(apt: { type_logement?: string | null; type_logement_ref?: TypeLogementRef | null }) {
  return apt.type_logement_ref?.slug || apt.type_logement || ''
}

export function logementTypeLabel(apt: { type_logement?: string | null; type_logement_ref?: TypeLogementRef | null }) {
  return apt.type_logement_ref?.nom || LEGACY_TYPE_LABELS[apt.type_logement ?? ''] || apt.type_logement || 'Type de logement'
}
