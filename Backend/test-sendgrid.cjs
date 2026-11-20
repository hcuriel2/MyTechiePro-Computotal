
require("dotenv").config();

if (
  !process.env.SENDGRID_API_KEY ||
  !process.env.SENDGRID_FROM_EMAIL ||
  !process.env.TEST_EMAIL
) {
  console.error("Missing SendGrid test configuration");
  process.exit(1);
}

const sendEmail =
  require("./dist/middleware/sendgrid.middleware").default;

async function test() {
  try {
    const response = await sendEmail(
      process.env.TEST_EMAIL,
      "MyTechiePro - SendGrid Test",
      "<h2>SendGrid Test</h2><p>Email integration is working!</p>"
    );

    console.log("SendGrid status:", response[0].statusCode);
  } catch (error) {
    console.error(
      "SendGrid failed:",
      error.response?.body || error.message
    );
    process.exitCode = 1;
  }
}

test();
