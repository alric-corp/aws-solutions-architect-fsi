import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../.site/loop-privado/output/', import.meta.url));
const manifest = JSON.parse(await fs.readFile(new URL('../../.site/loop-privado/review/source-map.json', import.meta.url), 'utf8'));
if (manifest.private !== true || manifest.pages?.length !== 2 || new Set(manifest.pages).size !== 2) throw new Error('Manifesto privado inválido. Gere novamente as páginas.');
const pages = manifest.pages.map(file => {
  const match = /^([a-z0-9]+(?:-[a-z0-9]+)*)\/index\.html$/.exec(file);
  if (!match || match[1] === 'assets') throw new Error('Rota privada inválida.');
  return { file, url: `/${match[1]}/` };
});
const portIndex = process.argv.indexOf('--port');
const port = portIndex < 0 ? 4321 : Number(process.argv[portIndex + 1]);
if (!Number.isInteger(port) || port < 1025 || port > 65535) throw new Error('Use uma porta entre 1025 e 65535.');
const routes = new Map([
  ...pages.map(page => [page.url, [page.file, 'text/html; charset=utf-8']]),
  ...['site.css','app.css'].map(name => [`/assets/${name}`, [`assets/${name}`, 'text/css; charset=utf-8']]),
  ['/assets/app.js', ['assets/app.js', 'text/javascript; charset=utf-8']],
  ['/assets/source-sans.woff2', ['assets/source-sans.woff2', 'font/woff2']]
]);
for (const [route, entry] of [...routes]) if (route.endsWith('/')) routes.set(`${route}index.html`, entry);
const policy = "default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data:; frame-src 'self' about:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'";
for (const page of pages) await fs.access(path.join(root, page.file));
const server = http.createServer(async (request, response) => {
  const headers = { 'cache-control': 'no-store', 'content-security-policy': policy, 'x-content-type-options': 'nosniff', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex, nofollow' };
  if (!['GET','HEAD'].includes(request.method) || ![`127.0.0.1:${port}`,`localhost:${port}`].includes(request.headers.host)) { response.writeHead(403, headers).end(); return; }
  let pathname;
  try { pathname = new URL(request.url, `http://127.0.0.1:${port}`).pathname; }
  catch { response.writeHead(400, headers).end(); return; }
  if (pathname === '/') { response.writeHead(302, { ...headers, location: pages[0].url }).end(); return; }
  const entry = routes.get(pathname);
  if (!entry) { response.writeHead(404, { ...headers, 'content-type': 'text/plain; charset=utf-8' }).end('Rota local indisponível.'); return; }
  try {
    const target = path.join(root, entry[0]);
    if ((await fs.lstat(target)).isSymbolicLink()) throw new Error('Arquivo simbólico não servido.');
    const body = await fs.readFile(target);
    response.writeHead(200, { ...headers, 'content-type': entry[1] }).end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404, headers).end(); }
});
server.listen(port, '127.0.0.1', () => console.log(`Privado, somente loopback:\n${pages.map(page => `http://127.0.0.1:${port}${page.url}`).join('\n')}\nNão compartilhe o painel inteiro. Ctrl+C encerra esta prévia.`));
