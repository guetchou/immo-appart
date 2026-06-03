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
      // Next.js tourne directement avec PM2 (hors Docker)
      // Le .next/ buildé est envoyé par rsync depuis GitHub Actions
      // pm2 restart suffit — zéro rebuild sur le serveur
      name:        'ndombi-nextjs',
      cwd:         '/opt/immo-appart/frontend',
      script:      'node_modules/.bin/next',
      args:        'start -p 3001',
      env: {
        NODE_ENV:               'production',
        PORT:                   '3001',
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
