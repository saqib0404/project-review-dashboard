import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test.describe("Real student-to-mentor workflow", () => {
  test.skip(
    !adminEmail || !adminPassword,
    "Dedicated E2E admin credentials are required",
  );

  test("student submits and mentor reviews", async ({ browser }) => {
    const studentContext = await browser.newContext();
    const mentorContext = await browser.newContext();

    const student = await studentContext.newPage();
    const mentor = await mentorContext.newPage();

    const suffix = randomUUID().replace(/-/g, "").slice(0, 16);

    const email = `e2e-${suffix}@example.com`;
    const password = "TestPassword123!";

    const projectName = `E2E Project ${suffix}`;
    const repositoryUrl = `https://github.com/e2e-testing/project-${suffix}`;

    try {
      // Create a real student account.
      await student.goto("/signup");

      await student.getByLabel("Full name").fill("E2E Test Student");

      await student.getByLabel("Email address").fill(email);

      await student.getByLabel("Password", { exact: true }).fill(password);

      await student.getByLabel("Confirm password").fill(password);

      await student.getByRole("button", { name: "Create account" }).click();

      await expect(student).toHaveURL(/\/login/);

      // Login as the student.
      await student.getByLabel("Email address").fill(email);

      await student.getByLabel("Password", { exact: true }).fill(password);

      await student.getByRole("button", { name: "Sign in" }).click();

      await expect(student).toHaveURL(/\/student/);

      // Submit the project.
      await student.getByLabel(/project name/i).fill(projectName);

      await student.getByLabel(/github repository url/i).fill(repositoryUrl);

      await student
        .getByLabel(/project description/i)
        .fill(
          "A complete automated end-to-end test project used to validate student submissions and reviewer decisions.",
        );

      await student
        .getByRole("button", {
          name: "Submit project",
        })
        .click();

      await expect(student.getByText(projectName)).toBeVisible();

      // Login as mentor/admin in another browser context.
      await mentor.goto("/login");

      await mentor.getByLabel("Email address").fill(adminEmail!);

      await mentor.getByLabel("Password", { exact: true }).fill(adminPassword!);

      await mentor.getByRole("button", { name: "Sign in" }).click();

      await expect(mentor).toHaveURL(/\/mentor/);

      // Filter pending submissions.
      await mentor
        .getByRole("button", { name: "Pending", exact: true })
        .click();

      // A unique project must be findable.
      await expect(mentor.getByText(projectName)).toBeVisible();

      const projectRow = mentor
        .getByRole("row")
        .filter({ hasText: projectName });

      await projectRow.getByRole("button", { name: "Approve" }).click();

      await mentor
        .getByRole("button", {
          name: "Confirm approval",
        })
        .click();

      await expect(
        mentor.getByText("Review decision saved successfully."),
      ).toBeVisible();

      // Student refreshes to see the real decision.
      await student.reload();

      await expect(
        student.getByText(/your project has been approved/i),
      ).toBeVisible();
    } finally {
      await studentContext.close();
      await mentorContext.close();
    }
  });
});
