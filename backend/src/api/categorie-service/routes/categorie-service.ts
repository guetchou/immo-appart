export default {
  routes: [
    { method: 'GET', path: '/categories-services', handler: 'categorie-service.find' },
    { method: 'GET', path: '/categories-services/:id', handler: 'categorie-service.findOne' },
    { method: 'POST', path: '/categories-services', handler: 'categorie-service.create' },
    { method: 'PUT', path: '/categories-services/:id', handler: 'categorie-service.update' },
    { method: 'DELETE', path: '/categories-services/:id', handler: 'categorie-service.delete' },
  ],
};
