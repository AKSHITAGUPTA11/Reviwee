const nodemailer = require("nodemailer");
const config = require("../../../config/config");

/**
 * Sends an email using Nodemailer
 * @param {Object} emailData - contains to, fullName, password, html, subject, attachments, etc.
 * @param {String} type - type of email (FORGOT_PASSWORD, OTHER, etc.)
 */
exports.sendEmailFunction = async (emailData, type) => {
  try {
    console.log("Initializing email send...");

    // --- Step 1: Configure transporter ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_MAIL_HOST,
      port: 587,
      secure: false, // true for port 465
      auth: {
        user: process.env.SMTP_MAIL_USER,
        pass: process.env.SMTP_MAIL_PASSWORD,
      },
      debug: true, // enable debug output
    });

    // --- Step 2: Verify transporter connection ---
    await transporter.verify();
    console.log("SMTP Server is ready to send emails");

    // --- Step 3: Create email body and subject ---
    let subject = "";
    let body_data = "";

    switch (type) {
      case "FORGOT_PASSWORD":
        subject = "Reviwee: Your New Password";
        body_data = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear ${emailData.fullName},</p>
        <p>Your new password has been successfully generated for your account.</p>
        <p>
          <strong>Password:</strong> ${emailData.password}
        </p>
        <p>Please log in and change your password as soon as possible for security reasons.</p>
        <br>
        <p>Best Regards,<br><strong>Reviwee</strong></p>
      </div>
    `;
        break;

      case "INVOICE_CREATED":
        subject = "Reviwee: Invoice Created Successfully";
        body_data = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>Dear ${emailData.fullName},</p>
        <p>Your invoice has been created successfully.</p>
        <p>You can view the complete details by logging into your account dashboard.</p>
        <br>
        <p>Best Regards,<br><strong>Reviwee</strong></p>
      </div>
    `;
        break;

      case "OTHER":
        subject = emailData.subject;
        body_data = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        ${emailData.html}
      </div>
    `;
        break;

      default:
        subject = emailData.subject || "No Subject";
        body_data = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        ${emailData.html || ""}
      </div>
    `;
        break;
    }

    // --- Step 4: Define mail options ---
    const mailOptions = {
      from: `"Reviwee" <${process.env.SMTP_EMAIL_ID}>`,
      to: emailData.to,
      subject: subject,
      html: body_data,
      attachments: Array.isArray(emailData.attachments)
        ? emailData.attachments
        : [],
    };

    console.log("Sending email to:", emailData.to);

    // --- Step 5: Send the email ---
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);

    // --- Step 6: Return result ---
    if (info && info.response && info.response.includes("250")) {
      return {
        sendStatus: true,
        response: info,
        error: false,
      };
    } else {
      return {
        sendStatus: false,
        response: info,
        error: true,
      };
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      sendStatus: false,
      response: {},
      error: true,
    };
  }
};
