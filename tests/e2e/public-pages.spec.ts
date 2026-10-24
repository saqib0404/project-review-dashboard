import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("homepage loads and displays navigation", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /from project submission/i,
      }),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Sign in" }).first(),
    ).toBeVisible();
  });

  test("visitor can navigate to student signup", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Get started" }).click();

    await expect(page).toHaveURL(/\/signup$/);

    await expect(
      page.getByRole("heading", {
        name: "Create your account",
      }),
    ).toBeVisible();
  });

  test("signup rejects mismatched passwords", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Full name").fill("Test Student");
    await page.getByLabel("Email address").fill("test@example.com");

    await page
      .getByLabel("Password", { exact: true })
      .fill("ValidPassword123!");

    await page.getByLabel("Confirm password").fill("DifferentPassword123!");

    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText("Passwords do not match")).toBeVisible();
  });

  test("login rejects an empty form", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Password is required")).toBeVisible();
  });

  test("homepage works at mobile width", async ({ page }) => {
    await page.setViewportSize({
      width: 375,
      height: 812,
    });

    await page.goto("/");

    await expect(page.getByRole("link", { name: "Get started" })).toBeVisible();

    const overflowing = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    expect(overflowing).toBe(false);
  });
});
