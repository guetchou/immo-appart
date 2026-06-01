export default {
  routes: [
    { method: 'GET',    path: '/avis',     handler: 'avis.find'    },
    { method: 'GET',    path: '/avis/:id', handler: 'avis.findOne' },
    { method: 'POST',   path: '/avis',     handler: 'avis.create'  },
    { method: 'PUT',    path: '/avis/:id', handler: 'avis.update'  },
    { method: 'DELETE', path: '/avis/:id', handler: 'avis.delete'  },
  ],
};
