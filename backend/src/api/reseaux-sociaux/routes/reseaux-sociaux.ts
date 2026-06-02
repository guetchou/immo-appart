export default {
  routes: [
    { method: 'GET', path: '/reseaux-sociaux', handler: 'reseaux-sociaux.find'   },
    { method: 'PUT', path: '/reseaux-sociaux', handler: 'reseaux-sociaux.update' },
  ],
};
