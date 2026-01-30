const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");
const nodemailer = require("nodemailer");

admin.initializeApp();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioPhone = functions.config().twilio.phone;

const client = twilio(accountSid, authToken);

// Gmail SMTP Configuration
// Set these using: firebase functions:config:set gmail.email="your@gmail.com" gmail.password="your-app-password"
// To get App Password: Google Account → Security → 2-Step Verification → App passwords
const gmailEmail = functions.config().gmail?.email;
const gmailPassword = functions.config().gmail?.password;

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailEmail,
      pass: gmailPassword,
    },
  });
};

// ============================================
// Send OTP Email - Triggered when new entry added to /emailQueue
// ============================================
exports.sendOTPEmail = functions.database
  .ref("/emailQueue/{emailId}")
  .onCreate(async (snapshot, context) => {
    const emailData = snapshot.val();
    const { emailId } = context.params;

    if (!emailData || emailData.status !== "pending") {
      return null;
    }

    try {
      const transporter = createTransporter();

      const mailOptions = {
        from: `"Doctor Finder" <${gmailEmail}>`,
        to: emailData.to,
        subject: "Your Verification Code - Doctor Finder",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🏥 Doctor Finder</h1>
            </div>
            <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${emailData.name}! 👋</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                You requested a verification code to sign up for Doctor Finder. 
                Please use the code below to complete your registration:
              </p>
              <div style="background: #f8f9fa; border: 2px dashed #667eea; border-radius: 10px; padding: 20px; text-align: center; margin: 25px 0;">
                <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${emailData.otp}</span>
              </div>
              <p style="color: #999; font-size: 14px;">
                ⏰ This code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="color: #999; font-size: 14px;">
                If you didn't request this code, please ignore this email.
              </p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Doctor Finder. All rights reserved.
              </p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("✅ OTP email sent to:", emailData.to);

      // Update status to sent
      await admin.database().ref(`/emailQueue/${emailId}`).update({
        status: "sent",
        sentAt: new Date().toISOString(),
      });

    } catch (error) {
      console.error("❌ Email send error:", error);

      // Update status to failed
      await admin.database().ref(`/emailQueue/${emailId}`).update({
        status: "failed",
        error: error.message,
        failedAt: new Date().toISOString(),
      });
    }

    return null;
  });

// Clean up old emails from queue (run daily)
exports.cleanupEmailQueue = functions.pubsub
  .schedule("every 24 hours")
  .onRun(async (context) => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours ago
    const emailQueueRef = admin.database().ref("/emailQueue");

    const snapshot = await emailQueueRef.orderByChild("createdAt").endAt(new Date(cutoff).toISOString()).get();

    if (snapshot.exists()) {
      const updates = {};
      snapshot.forEach((child) => {
        updates[child.key] = null;
      });
      await emailQueueRef.update(updates);
      console.log("Cleaned up old email queue entries");
    }

    return null;
  });

// Clean up expired OTPs
exports.cleanupExpiredOTPs = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    const now = Date.now();
    const otpRef = admin.database().ref("/otpVerification");

    const snapshot = await otpRef.get();

    if (snapshot.exists()) {
      const updates = {};
      snapshot.forEach((child) => {
        const data = child.val();
        if (data.expiresAt && data.expiresAt < now) {
          updates[child.key] = null;
        }
      });

      if (Object.keys(updates).length > 0) {
        await otpRef.update(updates);
        console.log("Cleaned up expired OTPs:", Object.keys(updates).length);
      }
    }

    return null;
  });

// Trigger on booking status change
exports.sendBookingSMS = functions.database
  .ref("/bookings/{doctorId}/{bookingId}/status")
  .onUpdate(async (change, context) => {
    const status = change.after.val();
    const { doctorId, bookingId } = context.params;

    if (status !== "accepted") return null;

    // Get booking details
    const bookingSnap = await admin.database().ref(`/bookings/${doctorId}/${bookingId}`).get();
    const booking = bookingSnap.val();
    if (!booking) return null;

    const message = `Hello ${booking.patientName}, your appointment with Dr. ${booking.doctorName} is confirmed.\nSerial: ${bookingId}\nTime: ${booking.createdAt}`;

    try {
      await client.messages.create({
        body: message,
        from: twilioPhone,
        to: `+${booking.phone}`, // patient number with country code
      });
      console.log("SMS sent to", booking.phone);
    } catch (error) {
      console.error("SMS send error:", error);
    }

    return null;
  });
