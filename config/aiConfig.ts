// AI Configuration
// Google Gemini API Configuration
// API Key from: https://aistudio.google.com/apikey

import Constants from "expo-constants";

// Read API key from Expo Constants (app.json extra field)
const getApiKey = () => {
    const key = Constants?.expoConfig?.extra?.GEMINI_API_KEY ||
        Constants?.manifest?.extra?.GEMINI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        "";

    console.log("Gemini API Key loaded:", key ? "Yes (length: " + key.length + ")" : "No");
    return key;
};

const API_KEY = getApiKey();

export const AI_CONFIG = {
    GEMINI_API_KEY: API_KEY,
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
    MODEL: "gemini-1.5-flash",
    SITE_URL: "https://doctor-finder-app.com",
    SITE_NAME: "Doctor Finder Medical Assistant",

    // System prompts
    MEDICAL_ASSISTANT_PROMPT: `You are a medical AI assistant that ONLY helps with medical questions and recommends which type of doctor to consult.

Your role:
1. If the question is medical-related: Provide a VERY SHORT analysis (1-2 sentences) and recommend the appropriate specialist doctor
2. If the question is NOT medical-related or confusing: Politely say "I can only assist with medical specialist recommendations. Please describe your health symptoms or concerns."

Important rules:
- Keep responses VERY SHORT and concise (under 100 words)
- Focus ONLY on doctor type recommendation
- No detailed medical advice or diagnosis
- Always remind to consult a real doctor
- If confused or non-medical: Say you only help with medical specialist recommendations`,
    // Specialty mapping
    SPECIALTIES: [
        "General Physician",
        "Cardiologist",
        "Dermatologist",
        "Pediatrician",
        "Orthopedic",
        "Neurologist",
        "Gynecologist",
        "ENT Specialist",
        "Ophthalmologist",
        "Psychiatrist",
        "Dentist",
        "Urologist",
    ],
};