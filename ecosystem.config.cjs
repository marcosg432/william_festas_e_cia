/**
 * PM2 - Senna Doces & Salgados
 * Usa porta 3003 (evita conflito com 22, 80, 3000, 3001, 3002, 53)
 */
module.exports = {
  apps: [
    {
      name: 'cardapio-senna',
      script: './node_modules/.bin/serve',
      args: '-l 3003',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
