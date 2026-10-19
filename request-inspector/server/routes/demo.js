// Sample endpoints that produce different kinds of traffic for the dashboard to inspect.
const router = require('express').Router();
const auth = require('../middleware/auth');

router.get('/ping', (req, res) => res.json({ message: 'pong' }));
router.get('/slow', (req, res) => setTimeout(() => res.json({ message: 'slow response' }), 800));
router.get('/error', (req, res) => res.status(500).json({ message: 'Simulated server error' }));
router.get('/protected', auth, (req, res) => res.json({ message: `Hello ${req.user.email}` }));
router.post('/echo', (req, res) => res.status(201).json({ received: req.body }));

module.exports = router;
