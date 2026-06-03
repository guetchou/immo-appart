export default {
  routes: [
    { method: 'GET', path: '/equipements', handler: 'equipement.find' },
    { method: 'GET', path: '/equipements/:id', handler: 'equipement.findOne' },
    { method: 'POST', path: '/equipements', handler: 'equipement.create' },
    { method: 'PUT', path: '/equipements/:id', handler: 'equipement.update' },
    { method: 'DELETE', path: '/equipements/:id', handler: 'equipement.delete' },
  ],
};
