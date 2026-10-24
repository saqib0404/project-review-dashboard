import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const publicPages = ["/", "/login", "/signup"];

for (const path of publicPages) {
  test(`accessibility audit: ${path}`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({
      page,
    })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2),
    ).toEqual([]);
  });
}
