export default {
  routes: [
    { method: 'GET',    path: '/publications-sociales',     handler: 'publication-sociale.find'    },
    { method: 'GET',    path: '/publications-sociales/:id', handler: 'publication-sociale.findOne' },
    { method: 'POST',   path: '/publications-sociales',     handler: 'publication-sociale.create'  },
    { method: 'PUT',    path: '/publications-sociales/:id', handler: 'publication-sociale.update'  },
    { method: 'DELETE', path: '/publications-sociales/:id', handler: 'publication-sociale.delete'  },
  ],
};
