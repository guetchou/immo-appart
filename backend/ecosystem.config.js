module.exports = {
  apps: [
    {
      name:       'ndombi-backend',
      script:     'node_modules/.bin/strapi',
      args:       'start',
      cwd:        __dirname,
      instances:  1,
      autorestart:true,
      watch:      false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT:     1337,
      },
    },
  ],
}
