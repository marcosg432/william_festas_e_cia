/**
 * PM2 — Willian Festas e Cia
 *
 * Na VPS (pasta do projeto):
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup   # seguir a instrução que o comando imprimir
 *
 * Logs: pm2 logs willian-festas-e-cia
 * Nginx: proxy_pass http://127.0.0.1:3018;
 */
module.exports = {
    apps: [
        {
            name: 'willian-festas-e-cia',
            script: './server.js',
            cwd: __dirname,
            instances: 1,
            exec_mode: 'fork',
            watch: false,
            max_memory_restart: '300M',
            env: {
                NODE_ENV: 'production',
                PORT: 3018
            }
        }
    ]
};
