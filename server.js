import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5173;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://www.gstatic.com https://cdnjs.cloudflare.com https://apis.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' data: blob: https:; connect-src 'self' https://*.googleapis.com https://*.google.com https://*.googleusercontent.com https://*.firebaseio.com https://*.firebaseapp.com https://www.gstatic.com wss://*.firebaseio.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';",
};

const server = http.createServer((req, res) => {
  let reqPath = '/';
  try {
    reqPath = decodeURIComponent(req.url.split('?')[0]);
  } catch (e) {
    res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 Bad Request');
    return;
  }

  // Local API Proxy for Google Apps Script Sheet Submission (/api/submit-sheet & /api/webhook)
  if ((reqPath === '/api/submit-sheet' || reqPath === '/api/webhook') && req.method === 'POST') {
    let bodyStr = '';
    req.on('data', chunk => {
      bodyStr += chunk;
      if (bodyStr.length > 512 * 1024) req.destroy();
    });
    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(bodyStr || '{}');
        const envWebhookUrl = (process.env.GAS_WEBHOOK_URL || '').trim();
        const envSpreadsheetId = (process.env.GOOGLE_SPREADSHEET_ID || '').trim();
        const envWebhookSecret = (process.env.GAS_WEBHOOK_SECRET || '').trim();
        const trimmedUrl = envWebhookUrl || (parsedBody.webhookUrl || '').trim();
        if (!trimmedUrl) {
          res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ status: 'error', message: '尚未設定 GAS_WEBHOOK_URL 環境變數或 Webhook 網址' }));
          return;
        }
        if (!/^https:\/\/script\.google\.com\/macros\/s\/[a-zA-Z0-9_-]+\/exec(\?.*)?$/.test(trimmedUrl)) {
          res.writeHead(400, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ status: 'error', message: '安全攔截：僅允許轉發至官方 Google Apps Script 網址' }));
          return;
        }
        const rawPayload = parsedBody.payload || parsedBody;
        const forwardPayload = {
          spreadsheetId: envSpreadsheetId || rawPayload.spreadsheetId || '',
          date: rawPayload.date || '',
          morning: rawPayload.morning || '',
          afternoon: rawPayload.afternoon || '',
          evening: rawPayload.evening || '',
          fullText: rawPayload.fullText || '',
          submittedAt: rawPayload.submittedAt || new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
          ...(envWebhookSecret ? { token: envWebhookSecret } : {}),
        };
        const gasRes = await fetch(trimmedUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(forwardPayload),
          redirect: 'follow',
        });
        if (!gasRes.ok) {
          res.writeHead(502, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ status: 'error', message: `Google Apps Script 回應異常 (HTTP ${gasRes.status})` }));
          return;
        }
        const text = await gasRes.text();
        let gasJson = null;
        try { gasJson = JSON.parse(text); } catch (err) { gasJson = null; }
        if (gasJson && gasJson.status === 'error') {
          res.writeHead(502, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ status: 'error', message: gasJson.message || '試算表腳本執行失敗' }));
          return;
        }
        res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'success', verified: Boolean(gasJson && gasJson.status === 'success') }));
      } catch (err) {
        res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ status: 'error', message: err?.message || '後端轉發失敗，請檢查網路連線' }));
      }
    });
    return;
  }

  if (reqPath === '/' || reqPath === '') {
    reqPath = '/index.html';
  }

  const resolvedBase = path.resolve(__dirname);
  const filePath = path.resolve(resolvedBase, '.' + reqPath);
  if (!filePath.startsWith(resolvedBase + path.sep) && filePath !== resolvedBase) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }
  const relPath = path.relative(resolvedBase, filePath);
  if (relPath.split(path.sep).some(part => part.startsWith('.'))) {
    res.writeHead(403, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA
      const indexPath = path.join(__dirname, 'index.html');
      fs.readFile(indexPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('404 Not Found');
        } else {
          res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': 'text/html; charset=utf-8' });
          res.end(content);
        }
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      } else {
        res.writeHead(200, { ...SECURITY_HEADERS, 'Content-Type': contentType });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n======================================================`);
  console.log(`🚀 FRC 10114 隊務管理系統已啟動！`);
  console.log(`🌐 本地伺服器位址: ${url}`);
  console.log(`📂 服務目錄: ${__dirname}`);
  console.log(`💡 提示：按 Ctrl+C 可停止伺服器`);
  console.log(`======================================================\n`);

  // Optional: auto open browser
  if (process.platform === 'win32') {
    exec(`start ${url}`);
  }
});
