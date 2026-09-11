// Petit serveur local pour tester l'appli Tournee sur l'ordinateur.
// Usage : node serve.js [port]
const http = require('http');
const fs = require('fs');
const path = require('path');

const racine = __dirname;
const port = Number(process.argv[2]) || 8791;
const types = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  if (p.endsWith('/')) p += 'index.html';
  const fichier = path.resolve(racine, '.' + p);
  if (!fichier.startsWith(racine + path.sep)) { res.writeHead(403); return res.end(); }
  fs.readFile(fichier, (err, contenu) => {
    if (err) { res.writeHead(404); return res.end('introuvable'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(fichier)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(contenu);
  });
}).listen(port, '127.0.0.1', () => console.log(`Tournee : http://localhost:${port}/`));
