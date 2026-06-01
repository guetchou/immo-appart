export default {
  routes: [
    { method: 'GET',    path: '/reservations',     handler: 'reservation.find'    },
    { method: 'GET',    path: '/reservations/:id', handler: 'reservation.findOne' },
    { method: 'POST',   path: '/reservations',     handler: 'reservation.create'  },
    { method: 'PUT',    path: '/reservations/:id', handler: 'reservation.update'  },
    { method: 'DELETE', path: '/reservations/:id', handler: 'reservation.delete'  },
  ],
};
