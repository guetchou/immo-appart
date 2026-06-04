export default {
  routes: [
    { method: 'GET', path: '/chat-config', handler: 'chat-config.find' },
    { method: 'PUT', path: '/chat-config', handler: 'chat-config.update' },
  ],
};
