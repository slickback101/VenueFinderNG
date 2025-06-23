function errorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(err.statusCode || 404).json({ error: err.message || 'Something went wrong' });
}

module.exports = errorHandler;
