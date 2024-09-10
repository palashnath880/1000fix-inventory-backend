import express, { Express } from "express";
import cors from "cors";

const app: Express = express();
const port = process.env.PORT;

app.use(express.json());
app.use(cors());

app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});
