export default {
  routes: [
    { method: 'GET', path: '/auth-espace-config', handler: 'auth-espace-config.find' },
    { method: 'PUT', path: '/auth-espace-config', handler: 'auth-espace-config.update' },
  ],
};
