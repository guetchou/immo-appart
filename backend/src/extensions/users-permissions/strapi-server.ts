type UsersPermissionsPlugin = {
  contentTypes?: {
    user?: {
      schema?: {
        attributes?: Record<string, unknown>;
      };
      attributes?: Record<string, unknown>;
    };
  };
};

export default (plugin: UsersPermissionsPlugin) => {
  const userContentType = plugin.contentTypes?.user;
  const schema = userContentType?.schema ?? userContentType;

  if (!schema) return plugin;

  schema.attributes = {
    ...schema.attributes,
    prenom: {
      type: 'string',
      required: false,
      maxLength: 80,
    },
    nom: {
      type: 'string',
      required: false,
      maxLength: 80,
    },
    telephone: {
      type: 'string',
      required: false,
      maxLength: 40,
    },
  };

  return plugin;
};
