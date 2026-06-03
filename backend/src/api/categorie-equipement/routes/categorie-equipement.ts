export default {
  routes: [
    { method: 'GET', path: '/categories-equipements', handler: 'categorie-equipement.find' },
    { method: 'GET', path: '/categories-equipements/:id', handler: 'categorie-equipement.findOne' },
    { method: 'POST', path: '/categories-equipements', handler: 'categorie-equipement.create' },
    { method: 'PUT', path: '/categories-equipements/:id', handler: 'categorie-equipement.update' },
    { method: 'DELETE', path: '/categories-equipements/:id', handler: 'categorie-equipement.delete' },
  ],
};
