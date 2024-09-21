import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";
import bodyParser from "body-parser";

const PORT = process.env.PORT || 5000;
const app = express();

export const prisma = new PrismaClient();

async function main() {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
  app.use(cors());

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
