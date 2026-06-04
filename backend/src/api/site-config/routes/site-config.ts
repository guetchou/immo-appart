export default {
  routes: [
    { method: 'GET', path: '/site-config', handler: 'site-config.find' },
    { method: 'PUT', path: '/site-config', handler: 'site-config.update' },
  ],
};
