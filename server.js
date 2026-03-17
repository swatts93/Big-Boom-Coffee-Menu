const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT      = 3000;
const MENU_FILE = path.join(__dirname, 'menu.json');
const ROOT      = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.jpeg': 'image/jpeg',
  '.jpg':  'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.pdf':  'application/pdf',
};

http.createServer((req, res) => {
  const url = req.url.split('?')[0];

  // GET /api/menu
  if (req.method === 'GET' && url === '/api/menu') {
    try {
      const data = fs.readFileSync(MENU_FILE, 'utf8');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('{}');
    }
    return;
  }

  // POST /api/menu
  if (req.method === 'POST' && url === '/api/menu') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        JSON.parse(body); // validate JSON before writing
        fs.writeFileSync(MENU_FILE, body, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch {
        res.writeHead(400);
        res.end('{"ok":false,"error":"Invalid JSON"}');
      }
    });
    return;
  }

  // Static files
  const filePath = path.join(ROOT, url === '/' ? '/landscape.html' : url);

  // Prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end();
    return;
  }

  const ext  = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });

}).listen(PORT, '0.0.0.0', () => {
  console.log('\nBig Boom Coffee — Menu Server');
  console.log('─────────────────────────────────────────');
  console.log(`  Landscape TV : http://localhost:${PORT}/landscape.html`);
  console.log(`  Portrait TV  : http://localhost:${PORT}/portrait.html`);
  console.log(`  Admin        : http://localhost:${PORT}/admin.html`);
  console.log('─────────────────────────────────────────');
  console.log('Press Ctrl+C to stop.\n');
});
