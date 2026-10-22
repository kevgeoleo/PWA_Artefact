import { chromium } from "playwright";
import fetch from "node-fetch";

// Helper: Random delay/coordinates for human-like behavior
const rand = (min, max) => Math.random() * (max - min) + min;

/**
 * Simulates a natural mouse move to an element
 */
async function humanMouseMove(page, element) {
  const box = await element.boundingBox();
  if (!box) return;

  const startX = rand(0, box.x);
  const startY = rand(0, box.y);
  const endX = box.x + box.width / 2;
  const endY = box.y + box.height / 2;

  await page.mouse.move(startX, startY);

  const steps = Math.floor(rand(15, 30));
  for (let i = 0; i <= steps; i++) {
    const x = startX + ((endX - startX) * i) / steps;
    const y = startY + ((endY - startY) * i) / steps;
    await page.mouse.move(x, y);
    await page.waitForTimeout(rand(5, 20));
  }
}

/**
 * Main automation task. 
 * @param {import('playwright').Browser} browser - The pre-launched browser instance
 * @param {string} email 
 * @param {string} password 
 * @param {Function} getOTP - A callback that returns a promise which resolves when OTP is input
 */
export async function runFacebookTask(browser, email, password, getOTP) {
  // Create a new context so users don't share cookies/sessions
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  try {
    console.log(`[${email}] Starting automation...`);
    await page.goto('https://facebook.com/login');

    // Handle Cookie Banner
    try {
      await page.getByRole('button', { name: /Allow all Cookies|Accept All/i }).first().click({ timeout: 5000 });
    } catch (e) {
      console.log("No cookie banner found.");
    }

    const emailInput = page.getByLabel('Email or mobile number');
    const passInput = page.getByLabel('Password');
    const loginBtn = page.getByRole('button', { name: 'Log in' });

    // Human-like typing: Email
    await humanMouseMove(page, emailInput);
    await emailInput.click();
    await page.keyboard.type(email, { delay: rand(80, 150) });
    await page.waitForTimeout(rand(300, 700));

    // Human-like typing: Password
    await humanMouseMove(page, passInput);
    await passInput.click();
    await page.keyboard.type(password, { delay: rand(100, 180) });
    await page.waitForTimeout(rand(500, 1000));

    // Submit
    await humanMouseMove(page, loginBtn);
    await loginBtn.click();

    await page.waitForLoadState('networkidle');

    // Check for 2FA
    try {
      await page.locator('text=Go to your authentication app').waitFor({ timeout: 10000 });
      console.log(`[${email}] 🔐 App-based 2FA detected`);

      // 1. Notify the frontend to redirect the user to the OTP entry page
      await fetch("http://localhost:3005/notify/authcode_facebook", { method: "POST" });

      // 2. Wait for the OTP from the server (passed via callback)
      const auth_code = await getOTP();
      
      const otpInput = page.getByLabel('Code');
      await otpInput.waitFor({ timeout: 15000 });
      await otpInput.fill(auth_code);

      await page.getByRole('button', { name: /Continue/i }).click();
      console.log(`[${email}] ✅ OTP submitted successfully`);
      
      await page.waitForLoadState('networkidle');
    } catch (e) {
      console.log(`[${email}] No 2FA required or timed out.`);
    }

    console.log(`[${email}] Automation finished.`);
  } catch (err) {
    console.error(`[${email}] ❌ Automation Error:`, err);
  } finally {
    // Keep context open for a bit to ensure submission finishes, then clean up
    await page.waitForTimeout(5000);
    await context.close();
  }
}