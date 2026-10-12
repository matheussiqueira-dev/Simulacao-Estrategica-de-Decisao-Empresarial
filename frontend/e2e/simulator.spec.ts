import AxeBuilder from "@axe-core/playwright";
import { type Page, expect, test } from "@playwright/test";

const kpiValue = (page: Page, label: string) =>
  page.locator("p", { hasText: new RegExp(`^${label}$`) }).locator("xpath=following-sibling::p[1]");

test("loads without console errors and shows the projection", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Simule o efeito/);
  await expect(page.getByRole("img", { name: /meses projetados/ })).toBeVisible();
  await expect(page.getByText("Desenvolvido por Matheus Siqueira")).toBeVisible();
  expect(errors).toEqual([]);
});

test("an emptied field shows an inline error and keeps the last result", async ({ page }) => {
  await page.goto("/");
  const price = page.getByRole("textbox", { name: "Preço de venda", exact: true });
  const profit = kpiValue(page, "Lucro mensal");
  const before = await profit.textContent();

  await price.fill("");
  await price.blur();

  await expect(price).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText(/^Campo vazio\. Digite um número entre 60 e 220/)).toBeVisible();
  await expect(profit).toHaveText(before ?? "");
});

test("an out-of-range value is clamped to the limit", async ({ page }) => {
  await page.goto("/");
  const price = page.getByRole("textbox", { name: "Preço de venda", exact: true });

  await price.fill("999");
  await price.blur();

  await expect(price).toHaveValue("220");
  await expect(page.getByText("Fora da faixa; ajustado para 220.")).toBeVisible();
});

for (const limit of ["60", "220"]) {
  test(`accepts the exact limit ${limit} without a notice`, async ({ page }) => {
    await page.goto("/");
    const price = page.getByRole("textbox", { name: "Preço de venda", exact: true });

    await price.fill(limit);
    await price.blur();

    await expect(price).toHaveValue(limit);
    await expect(price).not.toHaveAttribute("aria-invalid", "true");
    await expect(page.getByText(/Fora da faixa|Valor inválido|Campo vazio/)).toHaveCount(0);
  });
}

test("a negative value is clamped to the minimum", async ({ page }) => {
  await page.goto("/");
  const price = page.getByRole("textbox", { name: "Preço de venda", exact: true });

  await price.fill("-5");
  await price.blur();

  await expect(price).toHaveValue("60");
  await expect(page.getByText("Fora da faixa; ajustado para 60.")).toBeVisible();
});

test("non-numeric text is rejected inline and keeps the last result", async ({ page }) => {
  await page.goto("/");
  const price = page.getByRole("textbox", { name: "Preço de venda", exact: true });
  const profit = kpiValue(page, "Lucro mensal");
  const before = await profit.textContent();

  await price.fill("abc");
  await price.blur();

  await expect(price).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByText(/^Valor inválido\. Digite um número entre 60 e 220/)).toBeVisible();
  await expect(profit).toHaveText(before ?? "");
});

test("a pt-BR decimal updates the result and the shareable url", async ({ page }) => {
  await page.goto("/");
  const profit = kpiValue(page, "Lucro mensal");
  const before = await profit.textContent();

  await page.getByRole("textbox", { name: "Preço de venda", exact: true }).fill("150,5");

  await expect(page).toHaveURL(/[?&]price=150\.5\b/);
  await expect(profit).not.toHaveText(before ?? "");
});

test("a shared link restores its scenario and clamps invalid values", async ({ page }) => {
  await page.goto("/?price=150&demand=999999&foo=1");

  await expect(page.getByRole("textbox", { name: "Preço de venda", exact: true })).toHaveValue("150");
  await expect(page.getByRole("textbox", { name: "Demanda mensal", exact: true })).toHaveValue("4000");
});

for (const width of [320, 375, 768, 1024, 1440]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

for (const width of [320, 768, 1280]) {
  test(`has no serious or critical axe violations at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("img", { name: /meses projetados/ })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    const blocking = results.violations
      .filter((violation) => violation.impact === "serious" || violation.impact === "critical")
      .map((violation) => `${violation.id}: ${violation.nodes.length} node(s)`);
    expect(blocking).toEqual([]);
  });
}
