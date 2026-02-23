/**
 * 认证工具模块
 * 处理密码验证和权限控制
 */

function checkAuth(password, inputPassword) {
    if (!password) return true;
    return password === inputPassword;
}

function authMiddleware(config) {
    return (req, res, next) => {
        if (!config.password) {
            return next();
        }
        
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');
        
        if (token === config.password) {
            req.authenticated = true;
            return next();
        }
        
        if (req.path === '/api/verify' || req.path === '/api/info' || req.path === '/') {
            return next();
        }
        
        res.status(401).json({ error: '需要认证' });
    };
}

function generateToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

function hashPassword(password) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(password).digest('hex');
}

module.exports = {
    checkAuth,
    authMiddleware,
    generateToken,
    hashPassword
};
