module.exports = {
  apps: [
    {
      name:        'ndombi-strapi',
      cwd:         '/opt/immo-appart/backend',
      script:      'npm',
      args:        'run start',
      env: {
        NODE_ENV: 'production',
        PORT:     '1337',
      },
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: '800M',
      error_file:  '/var/log/pm2/ndombi-strapi-error.log',
      out_file:    '/var/log/pm2/ndombi-strapi-out.log',
    },
    {
      name:        'ndombi-nextjs',
      cwd:         '/opt/immo-appart/frontend',
      script:      'npm',
      args:        'run start -- -p 3001',
      env: {
        NODE_ENV:               'production',
        PORT:                   '3001',
        NEXT_PUBLIC_STRAPI_URL: 'http://160.113.0.124:1337',
      },
      instances:   1,
      autorestart: true,
      watch:       false,
      max_memory_restart: '600M',
      error_file:  '/var/log/pm2/ndombi-nextjs-error.log',
      out_file:    '/var/log/pm2/ndombi-nextjs-out.log',
    },
  ],
}
