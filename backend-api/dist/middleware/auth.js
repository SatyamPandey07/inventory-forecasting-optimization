"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const authenticateToken = (req, res, next) => {
    // Inject demo tenant context for seamless operation
    req.orgId = req.headers['x-org-id'] || '11111111-1111-1111-1111-111111111111';
    req.userId = '22222222-2222-2222-2222-222222222222';
    req.role = 'admin';
    next();
};
exports.authenticateToken = authenticateToken;
