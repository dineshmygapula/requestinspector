const Log = require('../models/Log');

// Records metadata of every request once the response has finished.
// Request bodies are never stored, so passwords and tokens are not leaked into logs.
module.exports = function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    // Skip the dashboard's own polling so it does not flood the log
    if (req.originalUrl.startsWith('/api/logs')) return;

    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    Log.create({
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userAgent: req.get('user-agent') || '',
    }).catch((err) => console.error('Log write failed:', err.message));
  });

  next();
};
