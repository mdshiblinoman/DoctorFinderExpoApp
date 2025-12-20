const functions = require("firebase-functions");
const admin = require("firebase-admin");
const twilio = require("twilio");

admin.initializeApp();

const accountSid = functions.config().twilio.sid;
const authToken = functions.config().twilio.token;
const twilioPhone = functions.config().twilio.phone;

const client = twilio(accountSid, authToken);

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
