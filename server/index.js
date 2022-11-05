import cors from "cors";
import express from "express";
import { generateMintData } from "./zkUtils.js";

const app = express();
const port = 8000;

const corsOptions = {
  // To allow requests from client
  origin: ["http://localhost:3000", "http://localhost:3001", "https://junction2022.vercel.app/"],
  credentials: true,
  exposedHeaders: ["set-cookie"],
};
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/submitRecord", async (req, res) => {
  console.log(req.query);
  const address = req.query.address;
  const score = req.query.score;
  if (isNaN(score)) {
    return res.status(400).send("score must be a number");
  }

  // TODO: validate address & score
  if (score < 200) {
    return res.status(200).send({ mintData: null });
  }

  // TODO: add authorization key to avoid Witch Attack
  const { a, b, c, Input } = await generateMintData(address, score);

  if (a === null || b === null || c === null || Input === null) {
    return res.status(400).send("Error generating call data");
  }

  return res.status(200).send({
    mintData: { a, b, c, Input },
  });
});
app.listen(port, () => {
  console.log(`[junction2022] Demo app listening on port ${port}`);
});
