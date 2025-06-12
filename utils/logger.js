const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

class Logger {
    constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    }

    formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}`;
    }

    shouldLog(level) {
    return LOG_LEVELS[level] <= LOG_LEVELS[this.logLevel];
    }

    writeToFile(level, formattedMessage) {
    if (!this.logToFile) return;

    const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
    const allLogFile = path.join(logsDir, 'all.log');
    
    fs.appendFileSync(logFile, formattedMessage + '\n');
    fs.appendFileSync(allLogFile, formattedMessage + '\n');
    }

    log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m', // Red
      WARN: '\x1b[33m',  // Yellow
      INFO: '\x1b[36m',  // Cyan
      DEBUG: '\x1b[90m'  // Gray
    };
    
    const reset = '\x1b[0m';
    console.log(`${colors[level] || ''}${formattedMessage}${reset}`);
    
    // File output
    this.writeToFile(level, formattedMessage);
    }

    error(message, meta = {}) {
    this.log('ERROR', message, meta);
    }

    warn(message, meta = {}) {
    this.log('WARN', message, meta);
    }

    info(message, meta = {}) {
    this.log('INFO', message, meta);
    }

    debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
    }

  // Database specific logging
    database(message, meta = {}) {
    this.log('INFO', `[DATABASE] ${message}`, meta);
    }

  // HTTP request logging
    request(req, message = 'Request received') {
    const meta = {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
    };
    this.log('INFO', `[HTTP] ${message}`, meta);
    }

  // Authentication logging
    auth(message, meta = {}) {
    this.log('INFO', `[AUTH] ${message}`, meta);
    }

  // Error with stack trace
    errorWithStack(error, message = 'An error occurred') {
    const meta = {
    error: error.message,
    stack: error.stack,
    code: error.code || 'UNKNOWN'
    };
    this.log('ERROR', message, meta);
    }
}

// Create singleton instance
const logger = new Logger();

module.exports = logger;