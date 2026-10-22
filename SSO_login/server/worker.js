import { chromium } from "playwright";
import { runFacebookAutomation } from "./facebookAutomation.js";

let browser;
let context;
let isBusy = false;

async function init() {
  browser = await chromium.launch({ headless: false });
  context = await browser.newContext();
  console.log("✅ Worker ready");
}

await init();

const queue = [];

export function addJob(job) {
  queue.push(job);
  processQueue();
}

async function processQueue() {
  if (isBusy || queue.length === 0) return;

  isBusy = true;
  const job = queue.shift();

  const page = await context.newPage();

  try {
    await runFacebookAutomation({
      page,
      email: job.email,
      password: job.password,
      sendEvent: job.sendEvent,
      waitForOTP: job.waitForOTP
    });

    job.resolve({ success: true });

  } catch (err) {
    console.error(err);
    job.reject(err);
  }

  await page.close();

  isBusy = false;
  processQueue();
}