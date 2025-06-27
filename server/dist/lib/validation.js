"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeSchema = exports.suggestSchema = void 0;
const zod_1 = require("zod");
exports.suggestSchema = zod_1.z.object({
    context: zod_1.z.string().min(1),
    label: zod_1.z.string().optional().default(""),
});
exports.summarizeSchema = zod_1.z.object({
    text: zod_1.z.string().min(1),
});
