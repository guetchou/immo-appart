export default {
  routes: [
    { method: 'GET',    path: '/types-logement',     handler: 'type-logement.find'    },
    { method: 'GET',    path: '/types-logement/:id', handler: 'type-logement.findOne' },
    { method: 'POST',   path: '/types-logement',     handler: 'type-logement.create'  },
    { method: 'PUT',    path: '/types-logement/:id', handler: 'type-logement.update'  },
    { method: 'DELETE', path: '/types-logement/:id', handler: 'type-logement.delete'  },
  ],
};
