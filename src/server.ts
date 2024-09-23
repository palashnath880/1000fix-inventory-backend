import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { hashPassword } from "./utils/user.utils";
dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();
const CLIENT_URLS = process.env.CLIENT_URLS;

export const prisma = new PrismaClient();

async function main() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

  const urls: string[] = CLIENT_URLS?.split(",") || [];
  const origins = urls || "*";

  app.use(cors({ origin: origins }));

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
    console.error(`prisma error`, err);
    await prisma.$disconnect();
    process.exit(1);
  });
