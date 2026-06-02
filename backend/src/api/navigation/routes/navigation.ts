export default {
  routes: [
    { method: 'GET', path: '/navigation', handler: 'navigation.find'   },
    { method: 'PUT', path: '/navigation', handler: 'navigation.update' },
  ],
};
