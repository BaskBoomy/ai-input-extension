"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const suggest_1 = __importDefault(require("./routes/suggest"));
const summarize_1 = __importDefault(require("./routes/summarize"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/suggest", suggest_1.default);
app.use("/api/summarize", summarize_1.default);
app.get("/", (_, res) => {
    res.send("AI Input Assistant Express Server");
});
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
