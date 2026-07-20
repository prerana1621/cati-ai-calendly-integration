require("dotenv").config();
const { test } = require("./services/calendlyService");

const mockConfig = {
  apiKey: process.env.CALENDLY_API_KEY,
};

async function runTests() {
  console.log("Testing Calendly Connection...");

  if (!mockConfig.apiKey) {
    console.error("Missing CALENDLY_API_KEY in environment variables.");
    return;
  }

  const testResult = await test(mockConfig);

  if (testResult.success) {
    console.log("Connection Successful:", testResult.message);
  } else {
    console.log("Connection Failed:", testResult.message);
  }
}

runTests();
