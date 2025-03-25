import express from "express";

const app = express();
const PORT = 3001;

app.get("/", (_req, res) => {
  res.send("The Reactor backend is live.");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
