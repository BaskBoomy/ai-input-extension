"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const llm_1 = require("../lib/llm");
const validation_1 = require("../lib/validation");
const router = (0, express_1.Router)();
router.get("/", async (req, res) => {
    const parse = validation_1.summarizeSchema.safeParse(req.query);
    if (!parse.success) {
        return res
            .status(400)
            .json({ error: "Invalid request", details: parse.error.errors });
    }
    try {
        const summary = await (0, llm_1.getSummary)(parse.data.text);
        return res.status(200).json({ summary });
    }
    catch (e) {
        return res
            .status(500)
            .json({ error: "LLM error", details: e.message });
    }
});
exports.default = router;
