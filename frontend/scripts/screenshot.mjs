import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  // Installed Edge by default: Windows App Control blocks the Chromium Playwright downloads.
  const browser = await chromium.launch({
    headless: true,
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(process.env.DEMO_URL || "http://localhost:3000", {
    waitUntil: "networkidle",
  });
  await page.waitForTimeout(1500);

  const outPng = path.join(scriptDir, "..", "..", "docs", "demo.png");
  await page.screenshot({ path: outPng, fullPage: true });
  await browser.close();

  console.log(`Screenshot salva em ${outPng}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
