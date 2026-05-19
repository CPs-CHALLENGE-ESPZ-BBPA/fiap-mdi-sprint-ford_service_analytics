const jsonServer  = require('json-server');
const bodyParser  = require('body-parser');

const server   = jsonServer.create();
const router   = jsonServer.router('db.json');
const defaults = jsonServer.defaults();

// Capture raw body BEFORE json-server's body-parser runs.
// body-parser checks req._body and skips if already set, so this is safe to
// insert before defaults() — json-server's body-parser becomes a no-op.
server.use(bodyParser.json({
  verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8'); },
}));

// ── Payload signing secret (must match app/utils/security.js) ─────────────
const PAYLOAD_SECRET = 'fsa-payload-2025-k3m7x';

// ── Structured security logger ─────────────────────────────────────────────
const slog = (level, event, details = {}) =>
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, event, ...details }));

// ── Anomaly detector: flags IPs with ≥3 security violations within 60 s ───
const anomalyMap = {};
const ANOMALY_WINDOW    = 60 * 1000;
const ANOMALY_THRESHOLD = 3;

const trackAnomaly = (ip, event) => {
  const now = Date.now();
  if (!anomalyMap[ip]) anomalyMap[ip] = [];
  anomalyMap[ip] = anomalyMap[ip].filter(t => now - t < ANOMALY_WINDOW);
  anomalyMap[ip].push(now);
  if (anomalyMap[ip].length >= ANOMALY_THRESHOLD) {
    slog('CRITICAL', 'ANOMALY_DETECTED', { ip, trigger: event, violations: anomalyMap[ip].length });
  }
};

// DJB2-based signature — identical to the client-side implementation
const djb2 = (str) => {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = (((h << 5) + h) ^ str.charCodeAt(i)) >>> 0;
  }
  return h.toString(36);
};


// ── HTTPS / Security headers ───────────────────────────────────────────────
server.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ── CORS — allow only authorised local origins ─────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:19000',
  'http://localhost:19006',
  'http://localhost:3000',
  'http://10.0.2.2:3000',
];

server.use((req, res, next) => {
  const origin = req.headers.origin;

  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin || 'http://localhost:8081');
  } else {
    slog('WARN', 'CORS_BLOCKED', { origin });
    return res.status(403).json({ error: 'Origin not allowed' });
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Payload-Signature, X-Request-Timestamp');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ── Server-side rate limiting ──────────────────────────────────────────────
const rateLimitMap  = {};
const RATE_WINDOW   = 60 * 1000; // 1 minute
const RATE_LIMITS   = { GET: 60, POST: 20, PUT: 20, PATCH: 20, DELETE: 10 };

server.use((req, res, next) => {
  const ip    = req.ip || req.socket?.remoteAddress || 'unknown';
  const key   = `${ip}:${req.method}`;
  const limit = RATE_LIMITS[req.method] ?? 30;
  const now   = Date.now();

  if (!rateLimitMap[key]) rateLimitMap[key] = [];
  rateLimitMap[key] = rateLimitMap[key].filter(t => now - t < RATE_WINDOW);

  if (rateLimitMap[key].length >= limit) {
    slog('WARN', 'RATE_LIMIT_EXCEEDED', { ip, method: req.method, path: req.path });
    trackAnomaly(ip, 'RATE_LIMIT');
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many requests. Try again in 60 seconds.' });
  }

  rateLimitMap[key].push(now);
  next();
});

// ── Block internal/meta endpoints exposed by json-server ──────────────────
server.use((req, res, next) => {
  const blocked = ['/db', '/__rules', '/__routes'];
  if (blocked.some(p => req.path === p || req.path.startsWith(p + '/'))) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});

// Apply json-server default middlewares (logger, body-parser, etc.)
server.use(defaults);

// ── Payload signature verification (runs after body-parser) ───────────────
server.use((req, res, next) => {
  if (!['POST', 'PUT', 'PATCH'].includes(req.method)) return next();

  const signature = req.headers['x-payload-signature'];
  const timestamp = req.headers['x-request-timestamp'];

  if (!signature || !timestamp) {
    slog('WARN', 'SIGNATURE_MISSING', { method: req.method, path: req.path, ip: req.ip });
    trackAnomaly(req.ip, 'SIGNATURE_MISSING');
    return res.status(400).json({ error: 'Missing payload signature headers' });
  }

  const age = Date.now() - parseInt(timestamp, 10);
  if (isNaN(age) || age > 5 * 60 * 1000) {
    slog('WARN', 'SIGNATURE_EXPIRED', { method: req.method, path: req.path, ageMs: age, ip: req.ip });
    trackAnomaly(req.ip, 'SIGNATURE_EXPIRED');
    return res.status(400).json({ error: 'Request timestamp expired or invalid' });
  }

  // Compare against the raw body bytes — identical to what the client signed.
  const bodyStr = req.rawBody || JSON.stringify(req.body);
  const expected = djb2(bodyStr + timestamp + PAYLOAD_SECRET);

  if (expected !== signature) {
    slog('ERROR', 'SIGNATURE_TAMPERED', { method: req.method, path: req.path, ip: req.ip });
    trackAnomaly(req.ip, 'SIGNATURE_TAMPERED');
    return res.status(400).json({ error: 'Invalid payload signature — request rejected' });
  }

  next();
});

// ── Audit trail for critical write operations ──────────────────────────────
server.use((req, res, next) => {
  if (req.method === 'POST' && req.path === '/carros') {
    slog('AUDIT', 'VEICULO_CADASTRADO', { ip: req.ip, nome: req.body?.nome, ano: req.body?.ano });
  }
  next();
});

server.use(router);

server.listen(3000, () => {
  console.log('');
  console.log('🔒 Ford Service Analytics API — porta 3000');
  console.log('   ✅ HTTPS headers: Strict-Transport-Security, X-Frame-Options');
  console.log('   ✅ CORS: apenas origens autorizadas');
  console.log('   ✅ Rate limiting: GET 60/min · POST 20/min · DELETE 10/min');
  console.log('   ✅ Payload signing: verificação ativa em POST/PUT/PATCH');
  console.log('');
});
