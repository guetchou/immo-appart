export default {
  routes: [
    { method: 'GET',    path: '/appartements',     handler: 'appartement.find'    },
    { method: 'GET',    path: '/appartements/:id', handler: 'appartement.findOne' },
    { method: 'POST',   path: '/appartements',     handler: 'appartement.create'  },
    { method: 'PUT',    path: '/appartements/:id', handler: 'appartement.update'  },
    { method: 'DELETE', path: '/appartements/:id', handler: 'appartement.delete'  },
  ],
};
