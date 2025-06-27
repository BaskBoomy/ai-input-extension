import { Router, Request, Response } from "express";
import { getSuggestion } from "../lib/llm";
import { suggestSchema } from "../lib/validation";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parse = suggestSchema.safeParse(req.query);
  if (!parse.success) {
    return res
      .status(400)
      .json({ error: "Invalid request", details: parse.error.errors });
  }
  try {
    const suggestion = await getSuggestion(
      parse.data.context,
      parse.data.label
    );
    return res.status(200).json({ suggestion });
  } catch (e) {
    return res
      .status(500)
      .json({ error: "LLM error", details: (e as Error).message });
  }
});

export default router;
