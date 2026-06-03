export default {
  routes: [
    { method: 'GET', path: '/politiques-annulation', handler: 'politique-annulation.find' },
    { method: 'GET', path: '/politiques-annulation/:id', handler: 'politique-annulation.findOne' },
    { method: 'POST', path: '/politiques-annulation', handler: 'politique-annulation.create' },
    { method: 'PUT', path: '/politiques-annulation/:id', handler: 'politique-annulation.update' },
    { method: 'DELETE', path: '/politiques-annulation/:id', handler: 'politique-annulation.delete' },
  ],
};
