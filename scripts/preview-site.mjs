import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.txt': 'text/plain', '.drawio': 'application/xml' };
const policy = JSON.parse(await fs.readFile(new URL('../site/aws-stack.json', import.meta.url), 'utf8')).Resources.ResponseHeaders.Properties.ResponseHeadersPolicyConfig.SecurityHeadersConfig.ContentSecurityPolicy.ContentSecurityPolicy;
http.createServer(async (request, response) => {
  try {
    let target = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (target.endsWith('/')) target += 'index.html';
    const filename = path.resolve(root, `.${target}`);
    if (!filename.startsWith(`${root.replace(/\/$/, '')}/`)) { response.writeHead(403).end(); return; }
    const buffer = await fs.readFile(filename);
    response.writeHead(200, { 'content-type': types[path.extname(filename)] || 'application/octet-stream', 'cache-control': 'no-cache', 'content-security-policy': policy });
    response.end(request.method === 'HEAD' ? undefined : buffer);
  } catch {
    response.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    response.end(await fs.readFile(path.join(root, '404.html')).catch(() => '404'));
  }
}).listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
