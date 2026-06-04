export default {
  routes: [
    { method: 'GET', path: '/page-paiement', handler: 'page-paiement.find' },
    { method: 'PUT', path: '/page-paiement', handler: 'page-paiement.update' },
  ],
};
