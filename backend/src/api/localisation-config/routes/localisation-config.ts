export default {
  routes: [
    { method: 'GET', path: '/localisation-config', handler: 'localisation-config.find' },
    { method: 'PUT', path: '/localisation-config', handler: 'localisation-config.update' },
  ],
};
