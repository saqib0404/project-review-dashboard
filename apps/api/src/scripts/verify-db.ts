import "dotenv/config";
import { prisma } from "../lib/prisma.js";

async function main() {
  const databaseResult = await prisma.$queryRaw<
    { database_name: string }[]
  >`SELECT current_database() AS database_name`;

  const [users, projects, reviews, sessions, admins] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.review.count(),
    prisma.refreshSession.count(),
    prisma.user.count({
      where: { role: "ADMIN" },
    }),
  ]);

  console.log("Database verification successful");
  console.log("-------------------------------");
  console.log("Database:", databaseResult[0]?.database_name);
  console.log("Users:", users);
  console.log("Projects:", projects);
  console.log("Reviews:", reviews);
  console.log("Refresh sessions:", sessions);
  console.log("Admin accounts:", admins);

  if (admins < 1) {
    throw new Error("No seeded admin found.");
  }

  console.log("All database checks passed.");
}

main()
  .catch((error) => {
    console.error("Database verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
