import "dotenv/config";
import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";

async function main() {
  const uniqueSuffix = crypto.randomUUID();

  try {
    await prisma.$transaction(async (tx) => {
      const student = await tx.user.create({
        data: {
          name: "Constraint Test Student",
          email: `constraint-${uniqueSuffix}@example.com`,
          passwordHash: "test-only-not-for-login",
          role: "STUDENT",
        },
      });

      await tx.project.create({
        data: {
          studentId: student.id,
          name: "Test Project One",
          description: "Temporary verification record",
          repositoryUrl: `https://github.com/example/${uniqueSuffix}-one`,
          repositoryKey: `example/${uniqueSuffix}-one`,
          status: "PENDING",
        },
      });

      try {
        await tx.project.create({
          data: {
            studentId: student.id,
            name: "Test Project Two",
            description: "Expected duplicate rejection",
            repositoryUrl: `https://github.com/example/${uniqueSuffix}-two`,
            repositoryKey: `example/${uniqueSuffix}-two`,
          },
        });

        throw new Error(
          "Unique constraint did not prevent duplicate submission.",
        );
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === "P2002"
        ) {
          console.log("PASS: Duplicate student project rejected.");
        } else {
          throw error;
        }
      }

      // Force rollback: this verification must not
      // retain test records in the database.
      throw new Error("TEST_ROLLBACK");
    });
  } catch (error) {
    if (error instanceof Error && error.message === "TEST_ROLLBACK") {
      console.log("PASS: Temporary data rolled back.");
      return;
    }

    throw error;
  }
}

main()
  .catch((error) => {
    console.error("Constraint verification failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
