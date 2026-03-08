/**
 * Servidor estático - Senna Doces & Salgados
 * Usa apenas módulos nativos do Node.js (sem dependências)
 * Porta 3003 - acessível via IP (sem domínio)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3003;
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp'
};

const server = http.createServer((req, res) => {
  let filePath = '.' + (req.url === '/' || req.url === '' ? '/index.html' : req.url);
  filePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404);
        res.end('Arquivo não encontrado');
      } else {
        res.writeHead(500);
        res.end('Erro do servidor');
      }
      return;
    }
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Senna Doces & Salgados: http://0.0.0.0:${PORT}`);
});
