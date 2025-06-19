const bcrypt = require('bcrypt');
const users = require('../users');

async function registerMiddleware(req, res, next) {
    const { username, password } = req.body;

  // Check if user already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
    return res.status(409).json({ message: 'User already exists' });
    }

  // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

  // Store user
    users.push({ username, password: hashedPassword });

    res.status(201).json({ message: 'Registration successful' });
}

module.exports = registerMiddleware;