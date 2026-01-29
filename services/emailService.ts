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
}

// ============================================
// EmailJS Configuration
// ============================================
// 1. Go to https://www.emailjs.com/ and create a free account
// 2. Add an Email Service (Gmail, Outlook, etc.)
// 3. Create an Email Template with these variables:
//    - {{to_email}} - recipient email
//    - {{to_name}} - recipient name  
//    - {{otp_code}} - verification code
// 4. Get your Service ID, Template ID, and Public Key
// 5. Replace the values below with your credentials

const EMAILJS_CONFIG = {
  serviceId: "service_9en3y8p",      // e.g., "service_abc123"
  templateId: "template_cjnfcxf",    // e.g., "template_xyz789"
  publicKey: "jNLtO-mW2XU-VqMsl",      // e.g., "abcdefghijk123456"
};

export async function sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
  try {
    // EmailJS API endpoint
    const emailjsUrl = "https://api.emailjs.com/api/v1.0/email/send";

    // Template parameters - make sure these match your EmailJS template variables
    const templateParams = {
      to_email: data.email,
      to_name: data.name || "User",
      otp_code: data.otp,
      app_name: "Doctor Finder",
      // Additional common variable names that EmailJS templates might use
      email: data.email,
      name: data.name || "User",
      message: `Your verification code is: ${data.otp}`,
      otp: data.otp,
      code: data.otp,
      verification_code: data.otp,
    };

    console.log("📧 Sending verification email to:", data.email);
    console.log("📧 OTP Code:", data.otp);

    const requestBody = {
      service_id: EMAILJS_CONFIG.serviceId,
      template_id: EMAILJS_CONFIG.templateId,
      user_id: EMAILJS_CONFIG.publicKey,
      template_params: templateParams,
    };

    console.log("📧 Request body:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(emailjsUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const responseText = await response.text();
    console.log("📧 Response status:", response.status);
    console.log("📧 Response text:", responseText);

    if (response.ok || responseText === "OK") {
      console.log("✅ Verification email sent successfully to:", data.email);
      return { success: true };
    } else {
      console.error("❌ EmailJS error:", responseText);

      // Show the actual error to help debug
      return {
        success: false,
        error: `EmailJS Error: ${responseText}`,
      };
    }
  } catch (error) {
    console.error("❌ Email verification error:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send verification email",
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