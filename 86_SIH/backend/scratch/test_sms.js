import 'dotenv/config';

const fast2smsApiKey = process.env.FAST2SMS_API_KEY ? process.env.FAST2SMS_API_KEY.trim() : null;
const phoneNumber = "9876543210";
const otp = "123456";

console.log("Testing Fast2SMS Key:", fast2smsApiKey);

if (!fast2smsApiKey) {
  console.log("No FAST2SMS_API_KEY found in .env!");
  process.exit(1);
}

async function testFast2SMS() {
  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": fast2smsApiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        numbers: phoneNumber
      })
    });

    const data = await response.json();
    console.log("Fast2SMS API Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testFast2SMS();
