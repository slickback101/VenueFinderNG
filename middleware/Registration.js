const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../users');

const SECRET_KEY = 'a3bd52d18458ddec9a578acbeb21a3363ab6b16f637a7d10a8a03bd6d2a1484e6c51598a6bc241a18f54a69201ecb62fdb54a16851d5411071613c635db579ce';

async function loginMiddleware(req, res, next) {
    const { username, password } = req.body;

    const user = users.find(user => user.username === username);
    if (!user) {
    return res.status(401).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
    return res.status(401).json({ message: 'Invalid password' });
    }

  // Create JWT token
    const token = jwt.sign({ username: user.username }, SECRET_KEY, {
    expiresIn: '1h'
    });

    res.json({ message: 'Login successful', token });
}

module.exports = loginMiddleware;