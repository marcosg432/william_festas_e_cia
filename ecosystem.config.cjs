/**
 * PM2 - Senna Doce
 * Usa porta 3003 (evita conflito com 22, 80, 3000, 3001, 3002, 53)
 * Funciona sem domínio - acesse via IP:3003
 */
module.exports = {
  apps: [
    {
      name: 'cardapio-senna',
      script: 'server.js',
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
