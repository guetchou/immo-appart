export default {
  routes: [
    { method: 'GET', path: '/footer-config', handler: 'footer-config.find'   },
    { method: 'PUT', path: '/footer-config', handler: 'footer-config.update' },
  ],
};
