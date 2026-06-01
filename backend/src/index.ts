import type { Core } from '@strapi/strapi';

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    // Custom logic at registration phase
  },

  bootstrap({ strapi }: { strapi: Core.Strapi }) {
    // Custom logic at bootstrap phase
  },
};
