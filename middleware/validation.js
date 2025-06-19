function validateUserInput(req, res, next) {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string') {
        return res.status(400).json({ message: 'Username must be a string' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    next();
}

module.exports = validateUserInput;
