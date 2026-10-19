const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const emailOk = (e) => typeof e === 'string' && /^\S+@\S+\.\S+$/.test(e);
const sign = (user) =>
  jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!emailOk(email) || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Valid email and a password of 6+ characters are required' });
  }
  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const user = await User.create({ email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), email: user.email });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = emailOk(email) && (await User.findOne({ email }));
  if (!user || !(await bcrypt.compare(String(password), user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  res.json({ token: sign(user), email: user.email });
});

module.exports = router;
