import express, { Request, Response } from "express";

const app = express();
const PORT = 3001;

app.get("/", (_req: Request, res: Response) => {
  res.send("The Reactor backend is live.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
