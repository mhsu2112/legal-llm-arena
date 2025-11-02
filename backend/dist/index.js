"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../.env') });
// Import database to initialize
require("./database/db");
// Import routes
const models_1 = __importDefault(require("./routes/models"));
const questions_1 = __importDefault(require("./routes/questions"));
const arena_1 = __importDefault(require("./routes/arena"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/models', models_1.default);
app.use('/api/questions', questions_1.default);
app.use('/api/arena', arena_1.default);
app.use('/api/analytics', analytics_1.default);
// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// Start server
app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║         Legal LLM Arena API Server                        ║
║                                                           ║
║  Server running on: http://localhost:${PORT}              ║
║  Environment: ${process.env.NODE_ENV || 'development'}                        ║
║                                                           ║
║  Available endpoints:                                     ║
║    GET  /health                                           ║
║    GET  /api/models                                       ║
║    GET  /api/questions                                    ║
║    POST /api/arena/match                                  ║
║    POST /api/arena/submit                                 ║
║    GET  /api/analytics/overview                           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});
exports.default = app;
