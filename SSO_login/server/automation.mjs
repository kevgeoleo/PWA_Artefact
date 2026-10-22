// Automation script for github

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import { firefox } from "playwright";
import fetch from "node-fetch";


function waitForOTP() {
  return new Promise((resolve) => {
    console.log("⏳ Waiting for OTP from frontend...");

    process.stdin.once("data", (data) => {
      const otp = data.toString().trim();
      console.log("✅ OTP received:", otp);
      resolve(otp);
    });
  });
}


// Load JSON file
const logPath = path.join(process.cwd(), "log.json");
//const data = JSON.parse(fs.readFileSync(logPath, "utf8"));

// Get last entry
/*const keys = Object.keys(data);
const lastKey = keys[keys.length - 1];
const { id: email, passwd: password } = data[lastKey];*/

// Get args 
const [,, email, password] = process.argv;

console.log("Email:", email);
console.log("Password:", password);

(async () => {
  /*const userDataDir = path.join(process.cwd(), 'temp-profile');
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false
  });*/
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  await page.goto('https://github.com/login');
  await page.getByLabel('Username or email address').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).first().click();
  await page.waitForLoadState('networkidle');

  // 2FA page detection 
  if (page.url().includes("/sessions/two-factor/sms/confirm")) {
      console.log("2FA SMS page detected! Clicking 'Send SMS'...");

      // Wait for the Send SMS button and then click it
      const smsButton = page.getByRole('button', { name: 'Send SMS' });
      await smsButton.waitFor({ timeout: 5000 });
      await smsButton.click();
      console.log("📤 SMS sent");

      // Notify frontend via SSE
      await fetch("http://localhost:3005/notify/sms", { method: "POST" });

      // ---- WAIT FOR OTP FROM FRONTEND ----
      const otp = await waitForOTP();

      // ---- FILL OTP ----
      //await page.getByLabel(/verification code/i).fill(otp);
      //await page.getByRole('button', { name: /verify|confirm/i }).click();
      await page.locator('#sms_totp, input[name="sms_otp"], input[inputmode="numeric"]').first().fill(otp);
      await page.getByRole('button', { name: /verify/i }).click();

      console.log("✅ OTP submitted");
      /*if (await smsButton.isVisible({ timeout: 5000 })) {
          await smsButton.click();
          console.log("Clicked 'Send SMS' successfully.");
          await fetch("http://localhost:3005/notify/sms", { method: "POST" });

      } else {
          console.log("Send SMS button not visible.");
      }*/
  } else {
      console.log("No SMS 2FA required.");
  }

})();
