export default {
  routes: [
    { method: 'GET',    path: '/services-premium',     handler: 'service-premium.find'    },
    { method: 'GET',    path: '/services-premium/:id', handler: 'service-premium.findOne' },
    { method: 'POST',   path: '/services-premium',     handler: 'service-premium.create'  },
    { method: 'PUT',    path: '/services-premium/:id', handler: 'service-premium.update'  },
    { method: 'DELETE', path: '/services-premium/:id', handler: 'service-premium.delete'  },
  ],
};
