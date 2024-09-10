import express from "express";
import cors from "cors";
import routes from "./routes";
import { PrismaClient } from "@prisma/client";

const PORT = process.env.PORT || 5000;
const app = express();

export const prisma = new PrismaClient();

async function main() {
  app.use(express.json());
  app.use(express.urlencoded());
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
