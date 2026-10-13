require("dotenv").config();
const app = require("./app");
const mailService = require("./app/services/mail.service");

const PORT = process.env.PORT || 9000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Resolve/verify the mail transport up front so the first OTP request is
  // not delayed (and any credential problem is logged at boot).
  try {
    await mailService.initMailer();
  } catch (error) {
    console.error(`[mail] Initialization error: ${error.message}`);
  }
});
