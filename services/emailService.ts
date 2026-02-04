// services/emailService.ts

export interface AcceptanceEmailData {
    patientEmail: string;
    patientName: string;
    doctorName: string;
    doctorDegree?: string;
    department?: string;
    hospital?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    appointmentDuration?: string;
    serialNumber?: string;
    acceptedAt?: string;
}

// Dummy implementation: just log and resolve success
export async function sendAcceptanceEmail(data: AcceptanceEmailData): Promise<{ success: boolean; error?: string }> {
    console.log("[Mock] Sending acceptance email:", data);
    // Simulate async
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { success: true };
}
