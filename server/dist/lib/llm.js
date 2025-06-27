"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = exports.getSuggestion = void 0;
const openai_1 = __importDefault(require("openai"));
require("dotenv/config");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
async function getSuggestion(context, label) {
    try {
        const prompt = `
원문 메시지 : ${label}
- 명확한 톤 지시: “격식을 갖추되, 너무 딱딱하지 않고 친근함이 느껴지는 비즈니스 톤” 등 구체적 지시.
- 문법/표현/명확성: “자연스럽고 명확하게”, “불명확한 부분이 있다면 자연스럽고 명확하게 수정” 등 반복 강조.
- 불필요한 설명 금지: “반드시 수정된 메시지만 반환하고, 그 외의 설명이나 부연은 포함하지 마세요.”
- 간결성: “불필요한 반복이나 장황한 표현은 간결하게 정리하세요.”
- 핵심 의도 보존: “메시지의 핵심 의도와 정보가 명확하게 전달되도록 하세요.”
`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "당신은 입력 보조 AI입니다." },
                { role: "user", content: prompt },
            ],
            max_tokens: 512,
            temperature: 0.7,
        });
        const result = completion.choices[0]?.message?.content?.trim() ?? "";
        return result;
    }
    catch (e) {
        throw new Error("OpenAI 추천 실패: " + e.message);
    }
}
exports.getSuggestion = getSuggestion;
async function getSummary(text) {
    try {
        const prompt = `다음 내용을 간결하고 핵심적으로 요약해줘.\n\n${text}`;
        const completion = await openai.chat.completions.create({
            model: "gpt-4-turbo",
            messages: [
                { role: "system", content: "당신은 입력 보조 AI입니다." },
                { role: "user", content: prompt },
            ],
            max_tokens: 512,
            temperature: 0.5,
        });
        const result = completion.choices[0]?.message?.content?.trim() ?? "";
        return result;
    }
    catch (e) {
        throw new Error("OpenAI 요약 실패: " + e.message);
    }
}
exports.getSummary = getSummary;
