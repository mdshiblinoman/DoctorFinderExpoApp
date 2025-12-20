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