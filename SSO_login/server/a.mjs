// test-launch.js
import { chromium } from "playwright";

(async () => {
  console.log("Testing launch...");
  try {
    const browser = await chromium.launch({ headless: false });
    console.log("SUCCESS! Browser is open.");
    await browser.close();
  } catch (e) {
    console.error("FAILURE:", e);
  }
})();