/**
 * FinGuardian AI - Servidor de Desenvolvimento Local e Proxy Anti-CORS
 * 
 * Este servidor roda 100% local com Node.js nativo (sem dependências externas).
 * Ele serve os arquivos estáticos do Frontend e redireciona chamadas da API
 * (/auth/* e /usuarios/*) diretamente para o Spring Boot em http://localhost:8080,
 * resolvendo qualquer bloqueio de CORS do navegador.
 * 
 * Para executar:
 * node Frontend/server.js
 * 
 * Em seguida, abra no navegador:
 * http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';
const BACKEND_PORT = process.env.BACKEND_PORT || 8080;
const FRONTEND_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function addCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

const server = http.createServer((req, res) => {
  addCorsHeaders(res);

  // Responde preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // 1. Redirecionar requisições da API para o Spring Boot (Proxy)
  if (pathname.startsWith('/auth') || pathname.startsWith('/usuarios') || pathname.startsWith('/contas') || pathname.startsWith('/dividas') || pathname.startsWith('/movimentacoes') || pathname.startsWith('/receitas') || pathname.startsWith('/despesas') || pathname.startsWith('/diario') || pathname.startsWith('/lista-compras') || pathname.startsWith('/recomendacoes') || pathname.startsWith('/dashboard') || pathname.startsWith('/analise-financeira') || pathname.startsWith('/api')) {
    const proxyOptions = {
      hostname: BACKEND_HOST,
      port: BACKEND_PORT,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${BACKEND_HOST}:${BACKEND_PORT}`
      }
    };

    const proxyReq = http.request(proxyOptions, (proxyRes) => {
      // Manter status e headers da API Spring Boot
      const headers = { ...proxyRes.headers };
      // Garantir CORS na resposta
      headers['access-control-allow-origin'] = '*';
      headers['access-control-allow-methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
      headers['access-control-allow-headers'] = 'Origin, X-Requested-With, Content-Type, Accept, Authorization';

      res.writeHead(proxyRes.statusCode, headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.error(`[Proxy Error] Não foi possível conectar ao Spring Boot em ${BACKEND_HOST}:${BACKEND_PORT}:`, err.message);
      res.writeHead(502, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        code: 'BAD_GATEWAY',
        message: `Falha ao conectar no backend Spring Boot (http://${BACKEND_HOST}:${BACKEND_PORT}). Verifique se o servidor backend está rodando.`,
        status: 502
      }));
    });

    req.pipe(proxyReq);
    return;
  }

  // 2. Servir arquivos estáticos do Frontend
  let filePath = path.join(FRONTEND_DIR, pathname === '/' ? 'index.html' : pathname);

  // Proteção contra Directory Traversal
  if (!filePath.startsWith(FRONTEND_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Se não achar o arquivo, tenta index.html para SPA
      filePath = path.join(FRONTEND_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 FinGuardian AI - Frontend Local & Proxy Rodando!`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`☕ Conectado ao Backend Spring Boot: http://${BACKEND_HOST}:${BACKEND_PORT}`);
  console.log('====================================================');
});
