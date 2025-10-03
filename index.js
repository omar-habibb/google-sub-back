const express = require("express");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

function isSafeInput(value) {
  if (typeof value !== 'string') return true; 
  const v = value.trim();
  if (/^[=+\-@]/.test(v)) return false;   // formula injection
  if (/<\s*script/i.test(v)) return false; // script injection
  return true;
}


// Route to send subscription data to Google Sheets
app.post("/subscribe", async (req, res) => {
  try {
    const payload = req.body;

    // Validate all string fields in the payload
for (const [key, val] of Object.entries(payload || {})) {
  if (!isSafeInput(val)) {
    return res.status(400).json({ success: false, message: `Invalid input in ${key}` });
  }
}

    // Send to Google Apps Script
    const scriptURL = process.env.SHEET_SCRIPT_URL;
    const response = await fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" }
    });

    res.status(200).json({ success: true, message: "Data sent to Google Sheets" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error sending to Google Sheets" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
