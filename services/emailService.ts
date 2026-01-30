import { db } from "@/firebaseConfig";
import { ref, set, remove, get } from "firebase/database";

interface EmailResult {
  success: boolean;
  error?: string;
}

interface AppointmentEmailData {
  patientEmail: string;
  patientName: string;
  doctorName: string;
  doctorDegree: string;
  department: string;
  hospital: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentDuration: string;
  serialNumber: string;
  acceptedAt: string;
}

interface VerificationEmailData {
  email: string;
  otp: string;
  name: string;
  phone?: string; // Optional phone number for SMS
}

// ============================================
// Twilio SMS Configuration
// ============================================
// 1. Go to https://www.twilio.com/ and create an account
// 2. Get your Account SID and Auth Token from Console Dashboard
// 3. Get a Twilio phone number (or use trial number)
// 4. Replace the values below

const TWILIO_CONFIG = {
  accountSid: "YOUR_TWILIO_ACCOUNT_SID",
  authToken: "YOUR_TWILIO_AUTH_TOKEN",
  phoneNumber: "+1234567890",
};

// Send OTP via Twilio SMS
export async function sendOTPviaSMS(phone: string, otp: string, name?: string): Promise<EmailResult> {
  try {
    console.log("📱 Sending OTP via SMS to:", phone);
    console.log("📱 OTP Code:", otp);

    // Format phone number (ensure it has country code)
    const formattedPhone = phone.startsWith("+") ? phone : `+${phone}`;

    // Store OTP in Firebase for verification (expires in 10 minutes)
    const otpRef = ref(db, `otpVerification/${formattedPhone.replace(/[+.#$[\]]/g, "_")}`);
    await set(otpRef, {
      otp: otp,
      phone: formattedPhone,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Twilio API credentials (Base64 encoded)
    const credentials = btoa(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`);

    // Send SMS using Twilio REST API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: TWILIO_CONFIG.phoneNumber,
          Body: `🏥 Doctor Finder: Your verification code is ${otp}. Valid for 10 minutes. Do not share this code.`,
        }).toString(),
      }
    );

    const responseData = await response.json();
    console.log("📱 Twilio Response:", response.status, responseData);

    if (response.ok && responseData.sid) {
      console.log("✅ SMS sent successfully! SID:", responseData.sid);
      return { success: true };
    } else {
      console.error("❌ Twilio error:", responseData);
      return {
        success: false,
        error: responseData.message || "Failed to send SMS"
      };
    }
  } catch (error) {
    console.error("❌ SMS error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS",
    };
  }
}

// Verify OTP (works for both SMS and Email)
export async function verifyOTP(identifier: string, otp: string): Promise<EmailResult> {
  try {
    // Sanitize identifier (email or phone)
    const sanitizedId = identifier.replace(/[+.#$[\]]/g, "_");
    const otpRef = ref(db, `otpVerification/${sanitizedId}`);
    const snapshot = await get(otpRef);

    if (!snapshot.exists()) {
      return { success: false, error: "OTP not found. Please request a new code." };
    }

    const data = snapshot.val();

    // Check if OTP is expired
    if (Date.now() > data.expiresAt) {
      await remove(otpRef);
      return { success: false, error: "OTP has expired. Please request a new one." };
    }

    // Check if OTP matches
    if (data.otp !== otp) {
      return { success: false, error: "Invalid OTP code" };
    }

    // OTP verified - clean up
    await remove(otpRef);
    return { success: true };
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to verify OTP",
    };
  }
}

// ============================================
// Email sending (kept for backwards compatibility)
// ============================================

const EMAILJS_CONFIG = {
  serviceId: "service_tfu7kih",
  templateId: "template_cjnfcxf",
  publicKey: "jNLtO-mW2XU-VqMsl",
};

export async function sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
  // If phone is provided, send via SMS instead
  if (data.phone) {
    return sendOTPviaSMS(data.phone, data.otp, data.name);
  }

  try {
    console.log("📧 Sending verification email to:", data.email);
    console.log("📧 OTP Code:", data.otp);

    // Store OTP in Firebase for verification (expires in 10 minutes)
    const otpRef = ref(db, `otpVerification/${data.email.replace(/[.#$[\]]/g, "_")}`);
    await set(otpRef, {
      otp: data.otp,
      email: data.email,
      createdAt: Date.now(),
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    });

    // Send using EmailJS
    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        service_id: EMAILJS_CONFIG.serviceId,
        template_id: EMAILJS_CONFIG.templateId,
        user_id: EMAILJS_CONFIG.publicKey,
        template_params: {
          to_email: data.email,
          to_name: data.name || "User",
          otp_code: data.otp,
          email: data.email,
          name: data.name || "User",
          otp: data.otp,
          code: data.otp,
          verification_code: data.otp,
          message: `Your Doctor Finder verification code is: ${data.otp}`,
        },
      }),
    });

    const responseText = await response.text();
    console.log("📧 EmailJS Response:", response.status, responseText);

    if (response.ok || responseText === "OK") {
      console.log("✅ Email sent via EmailJS!");
      return { success: true };
    } else {
      return { success: false, error: `EmailJS: ${responseText}` };
    }
  } catch (error) {
    console.error("❌ Email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}

export async function sendAcceptanceEmail(data: AppointmentEmailData): Promise<EmailResult> {
  try {
    // Here you would typically integrate with your email service provider
    // For now, we'll just simulate a successful email send
    console.log('Email would be sent with data:', data);

    // Simulated successful response
    return {
      success: true
    };
  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}