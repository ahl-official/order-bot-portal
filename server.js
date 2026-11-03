const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)=(.*)$/);
    if (match) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });
}

// Also check AHL_BOT_CREDENTIALS.env in parent directory
const parentEnv = path.join(__dirname, '..', 'AHL_BOT_CREDENTIALS.env');
if (fs.existsSync(parentEnv)) {
  fs.readFileSync(parentEnv, 'utf8').split(/\r?\n/).forEach(line => {
    const match = line.match(/^\s*([^#][^=]*)=(.*)$/);
    if (match && !process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
  });
}

const lookupHandler = require('./api/lookup');
const saveHandler = require('./api/save');
const repeatHandler = require('./api/repeat');
const ordersHandler = require('./api/orders');
const historyHandler = require('./api/history');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Polyfill Express-like req / res helpers for Vercel serverless handlers
  req.query = parsedUrl.query;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
    return res;
  };

  // Helper to read JSON request body
  const readBody = () => new Promise(resolve => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { req.body = JSON.parse(body); }
      catch(e) { req.body = {}; }
      resolve();
    });
  });

  // Routing API requests
  if (pathname === '/api/orders') {
    return ordersHandler(req, res);
  }
  if (pathname === '/api/history') {
    return historyHandler(req, res);
  }
  if (pathname === '/api/lookup') {
    return lookupHandler(req, res);
  }
  if (pathname === '/api/save') {
    await readBody();
    return saveHandler(req, res);
  }
  if (pathname === '/api/repeat') {
    await readBody();
    return repeatHandler(req, res);
  }

  // Static File Serving from public/
  let filePath = path.join(__dirname, 'public', pathname === '/' ? 'index.html' : pathname);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Fallback to index.html for SPA client-side routing
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (e, indexContent) => {
          if (e) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(indexContent, 'utf-8');
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 AHL Order Portal running at: http://localhost:${PORT}`);
  console.log(`==================================================\n`);
});

