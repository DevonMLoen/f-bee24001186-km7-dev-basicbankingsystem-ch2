const { PrismaClient } = require("@prisma/client");

console.log("process.env.DATABASE_URL");
console.log(process.env.DATABASE_URL);
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});
module.exports = prisma;
