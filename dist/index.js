"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = require("body-parser");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const db_1 = __importDefault(require("./models/db")); // <-- Make sure this is imported to access the database
const conversationRoutes_1 = __importDefault(require("./routes/conversationRoutes"));
const app = (0, express_1.default)();
app.use((0, body_parser_1.json)());
// Register auth routes
app.use('/auth', authRoutes_1.default);
app.use('/conversation', conversationRoutes_1.default);
// Test DB connection route
app.get('/test-db', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield db_1.default.query('SELECT NOW()');
        res.json(result.rows);
    }
    catch (error) {
        console.error('DB test failed:', error); // Already here, good
        res.status(500).json({ message: 'DB connection failed', error });
    }
}));
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
