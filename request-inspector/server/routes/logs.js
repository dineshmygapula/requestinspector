const router = require('express').Router();
const auth = require('../middleware/auth');
const Log = require('../models/Log');

router.use(auth);

// GET /api/logs?method=GET&status=4xx&search=/api&page=1&limit=20
router.get('/', async (req, res) => {
  const { method, status, search } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const filter = {};
  if (method) filter.method = method.toUpperCase();
  if (/^[1-5]xx$/.test(status || '')) {
    const base = parseInt(status[0]) * 100;
    filter.status = { $gte: base, $lt: base + 100 };
  }
  if (search) filter.path = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };

  const [items, total] = await Promise.all([
    Log.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Log.countDocuments(filter),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

router.get('/stats', async (req, res) => {
  const [summary] = await Log.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        avgMs: { $avg: '$durationMs' },
        errors: { $sum: { $cond: [{ $gte: ['$status', 400] }, 1, 0] } },
      },
    },
  ]);
  const byMethod = await Log.aggregate([{ $group: { _id: '$method', count: { $sum: 1 } } }]);
  const total = summary?.total || 0;
  res.json({
    total,
    avgMs: Math.round((summary?.avgMs || 0) * 100) / 100,
    errorRate: total ? Math.round((summary.errors / total) * 1000) / 10 : 0,
    byMethod,
  });
});

router.delete('/', async (req, res) => {
  await Log.deleteMany({});
  res.json({ message: 'Logs cleared' });
});

module.exports = router;
