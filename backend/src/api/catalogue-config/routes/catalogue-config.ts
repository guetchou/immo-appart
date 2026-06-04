export default {
  routes: [
    { method: 'GET', path: '/catalogue-config', handler: 'catalogue-config.find' },
    { method: 'PUT', path: '/catalogue-config', handler: 'catalogue-config.update' },
  ],
};
