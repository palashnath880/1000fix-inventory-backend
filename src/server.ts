import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const CLIENT_URL = process.env.CLIENT_URL;

export const prisma = new PrismaClient();

async function main() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

  const origins = CLIENT_URL || "*";

  app.use(cors({ origin: origins, credentials: true }));
  app.use(cookieParser());

  app.get("/", (req, res) => {
    res.redirect(`https://1000fix.com/`);
  });

  app.use(routes);

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

main()
  .then(async () => {
    await prisma.$connect();
  })
  .catch(async (err) => {
    console.error(`server error`, err);
    await prisma.$disconnect();
    process.exit(1);
  });
