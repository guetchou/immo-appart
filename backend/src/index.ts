import type { Core } from '@strapi/strapi';

type SeedItem = Record<string, unknown> & { slug: string }

const typeLogementSeeds: SeedItem[] = [
  {
    nom: "Studio",
    slug: "studio",
    description_simple: "Une seule piece avec espace salon/chambre et cuisine",
    ordre_affichage: 10,
    actif: true,
  },
  {
    nom: "Appartement 1 chambre",
    slug: "appartement-1-chambre",
    description_simple: "Salon + 1 chambre separee",
    ordre_affichage: 20,
    actif: true,
  },
  {
    nom: "Appartement 2 chambres",
    slug: "appartement-2-chambres",
    description_simple: "Salon + 2 chambres separees",
    ordre_affichage: 30,
    actif: true,
  },
  {
    nom: "Appartement 3 chambres",
    slug: "appartement-3-chambres",
    description_simple: "Salon + 3 chambres separees",
    ordre_affichage: 40,
    actif: true,
  },
  {
    nom: "Appartement 4 chambres",
    slug: "appartement-4-chambres",
    description_simple: "Salon + 4 chambres separees",
    ordre_affichage: 50,
    actif: true,
  },
  {
    nom: "Villa 2 chambres",
    slug: "villa-2-chambres",
    description_simple: "Maison avec salon et 2 chambres",
    ordre_affichage: 60,
    actif: true,
  },
  {
    nom: "Villa 3 chambres",
    slug: "villa-3-chambres",
    description_simple: "Maison avec salon et 3 chambres",
    ordre_affichage: 70,
    actif: true,
  },
  {
    nom: "Villa 4 chambres et plus",
    slug: "villa-4-chambres-et-plus",
    description_simple: "Maison avec 4 chambres ou davantage",
    ordre_affichage: 80,
    actif: true,
  },
  {
    nom: "Duplex",
    slug: "duplex",
    description_simple: "Logement sur deux niveaux",
    ordre_affichage: 90,
    actif: true,
  },
  {
    nom: "Autres",
    slug: "autres",
    description_simple: "Autre configuration de logement",
    ordre_affichage: 100,
    actif: true,
  },
]

const politiqueAnnulationSeeds: SeedItem[] = [
  {
    nom: "Flexible",
    slug: "flexible",
    description_simple: "Remboursement integral sous 48h",
    ordre_affichage: 10,
    actif: true,
  },
  {
    nom: "Moderee",
    slug: "moderee",
    description_simple: "Remboursement 50% jusqu'a 5 jours avant",
    ordre_affichage: 20,
    actif: true,
  },
  {
    nom: "Stricte",
    slug: "stricte",
    description_simple: "Non remboursable a partir de 14 jours avant",
    ordre_affichage: 30,
    actif: true,
  },
  {
    nom: "Non remboursable",
    slug: "non-remboursable",
    description_simple: "Aucun remboursement apres confirmation",
    ordre_affichage: 40,
    actif: true,
  },
]

const categorieEquipementSeeds: SeedItem[] = [
  { nom: "Connectivite", slug: "connectivite", ordre_affichage: 10, actif: true },
  { nom: "Confort", slug: "confort", ordre_affichage: 20, actif: true },
  { nom: "Cuisine", slug: "cuisine", ordre_affichage: 30, actif: true },
  { nom: "Securite", slug: "securite", ordre_affichage: 40, actif: true },
  { nom: "Exterieur", slug: "exterieur", ordre_affichage: 50, actif: true },
  { nom: "Transport", slug: "transport", ordre_affichage: 60, actif: true },
  { nom: "Divertissement", slug: "divertissement", ordre_affichage: 70, actif: true },
  { nom: "Sante", slug: "sante", ordre_affichage: 80, actif: true },
  { nom: "Bebe", slug: "bebe", ordre_affichage: 90, actif: true },
  { nom: "Accessibilite", slug: "accessibilite", ordre_affichage: 100, actif: true },
]

async function seedCollection(strapi: Core.Strapi, uid: string, items: SeedItem[]) {
  const documents = (strapi as any).documents(uid)

  for (const item of items) {
    const existing = await documents.findFirst({
      filters: { slug: item.slug },
    })

    if (!existing) {
      await documents.create({
        data: item,
        status: "published",
      })
    }
  }
}

async function seedSingle(strapi: Core.Strapi, uid: string, data: Record<string, unknown>) {
  const documents = (strapi as any).documents(uid)
  const existing = await documents.findFirst()

  if (!existing) {
    await documents.create({
      data,
      status: "published",
    })
  }
}

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Custom logic at registration phase
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await seedCollection(strapi, "api::type-logement.type-logement", typeLogementSeeds)
    await seedCollection(strapi, "api::politique-annulation.politique-annulation", politiqueAnnulationSeeds)
    await seedCollection(strapi, "api::categorie-equipement.categorie-equipement", categorieEquipementSeeds)
    await seedSingle(strapi, "api::page-a-propos.page-a-propos", {})
    await seedSingle(strapi, "api::page-paiement.page-paiement", {})
    await seedSingle(strapi, "api::page-reglement.page-reglement", {})
    await seedSingle(strapi, "api::site-config.site-config", {})
    await seedSingle(strapi, "api::catalogue-config.catalogue-config", {})
    await seedSingle(strapi, "api::chat-config.chat-config", {})
    await seedSingle(strapi, "api::detail-appartement-config.detail-appartement-config", {})
    await seedSingle(strapi, "api::auth-espace-config.auth-espace-config", {})
    await seedSingle(strapi, "api::localisation-config.localisation-config", {})
  },
};
