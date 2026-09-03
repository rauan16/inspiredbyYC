import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  
  // Set fake token before any page loads
  await context.addInitScript(() => {
    localStorage.setItem("ulys-token", "fake-token");
  });
  
  const page = await context.newPage();
  
  // Mock auth API and opportunities API
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "test", email: "test@test.com", name: "Test User" }),
    });
  });
  
  await page.route("**/api/opportunities*", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
  
  await page.goto("http://localhost:3000/app/opportunities", { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  
  await page.screenshot({ path: "C:/Users/brawl/Downloads/ulys-phase1_1/ulys/opportunity-hub.png", fullPage: true });
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log("=== PAGE TEXT (first 3000 chars) ===");
  console.log(text.slice(0, 3000));
  
  const ids = ["almaty-marathon-volunteer", "almaty-youth-forum", "overclockers-community", "almaty-hub-market-entry", "hackaleem-ai"];
  console.log("\n=== Opportunity IDs ===");
  for (const id of ids) {
    console.log(id + ":", text.toLowerCase().includes(id.replace(/-/g, " ")) || text.includes(id) ? "FOUND" : "MISSING");
  }
  
  console.log("\n=== Card Titles Check ===");
  const titles = ["Almaty Marathon", "Youth Forum", "Overclockers", "Market Entry", "HackAlem"];
  for (const t of titles) {
    console.log(t + ":", text.includes(t) ? "FOUND" : "MISSING");
  }
  
  console.log("\n=== Category Labels ===");
  const labels = ["Волонтёрство", "Форум", "IT Сообщество", "Акселератор", "Хакатон"];
  for (const l of labels) {
    console.log(l + ":", text.includes(l) ? "FOUND" : "MISSING");
  }
  
  await browser.close();
})();
