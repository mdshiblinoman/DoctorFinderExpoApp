// AI Configuration
// OpenRouter API Configuration
// API Key from: https://openrouter.ai/
// This file attempts to read the public API key from multiple runtime-friendly places:
// 1. `@env` (react-native-dotenv) which injects env vars at build time
// 2. Expo Constants extras (app.json / eas secrets) available at runtime

import Constants from "expo-constants";
// react-native-dotenv exposes env vars via '@env' if configured in babel
// (package.json already lists react-native-dotenv). If you don't use it,
// ensure you set `expo.extra` in app.json or use EAS secrets.
let RN_DOTENV_KEY = "";
try {
    // dynamic import to avoid bundler errors when the plugin isn't configured
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const env = require("@env");
    RN_DOTENV_KEY = env.EXPO_PUBLIC_OPENROUTER_API_KEY || "";
} catch (e) {
    RN_DOTENV_KEY = "";
}

const EXPO_EXTRA_KEY = (Constants?.expoConfig?.extra || Constants?.manifest?.extra || {}).EXPO_PUBLIC_OPENROUTER_API_KEY || "";

export const AI_CONFIG = {
    OPENROUTER_API_KEY: RN_DOTENV_KEY || EXPO_EXTRA_KEY || "",
    API_URL: "https://openrouter.ai/api/v1/chat/completions",
    MODEL: "meta-llama/llama-3.2-3b-instruct:free", // Changed from gemma (better instruction support)
    SITE_URL: "https://doctor-finder-app.com", // Your app URL
    SITE_NAME: "Doctor Finder Medical Assistant", // Your app name

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
- If confused or non-medical: Say you only help with medical specialist recommendations`,    // Specialty mapping
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