import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({
    headless: false,
    executablePath: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe"
  });

  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto("brave://settings/content/siteDetails?site=https%3A%2F%2Faccounts.google.com");
})();

/*const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe",
    headless: false
  });

  const page = await browser.newPage();
  await page.goto("https://example.com");
})();*/