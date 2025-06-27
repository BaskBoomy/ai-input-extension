import { Router, Request, Response } from "express";
import { getSummary } from "../lib/llm";
import { summarizeSchema } from "../lib/validation";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parse = summarizeSchema.safeParse(req.query);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: parse.error.errors });
  }
  try {
    const summary = await getSummary(parse.data.text);
    return res.status(200).json({ summary });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "LLM error", details: (e as Error).message });
  }
});

export default router;
