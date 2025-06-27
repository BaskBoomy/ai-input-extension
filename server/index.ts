import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import suggestRouter from "./routes/suggest";
import summarizeRouter from "./routes/summarize";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

app.use("/api/suggest", suggestRouter);
app.use("/api/summarize", summarizeRouter);

app.get("/", (_: Request, res: Response) => {
  res.send("AI Input Assistant Express Server");
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
