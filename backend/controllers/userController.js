const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

const registerUser = async (req, res) => {
  const { username, password, email } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword, email });
  await user.save();
  res.json({ message: 'User registered successfully' });
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
};

module.exports = { registerUser, getUsers };