const mailSender = require("./smart-elearning-backend/utils/mailSender");

mailSender(
  "frankkiruma05@gmail.com",
  "SMTP Test",
  "<h1>This is a test email from your server</h1>"
)
  .then(() => console.log("Email sent successfully"))
  .catch((err) => console.error("Email sending failed:", err));

