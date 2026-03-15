import { AI_CONFIG } from "@/config/aiConfig";
import { theme } from "@/constants/theme";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  "I have a headache",
  "Feeling tired",
  "Stomach pain",
  "Skin rash",
  "Back pain",
];

export default function AIChatScreen() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI Medical Assistant.\n\nI can help you understand your symptoms and suggest the right specialist doctor. Please describe what you're experiencing.",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const generateAIResponse = async (userMessage: string) => {
    console.log(
      "API Key status:",
      AI_CONFIG.GEMINI_API_KEY ? `Set (${AI_CONFIG.GEMINI_API_KEY.substring(0, 10)}...)` : "NOT SET"
    );
    console.log("API URL:", AI_CONFIG.API_URL);

    if (!AI_CONFIG.GEMINI_API_KEY || AI_CONFIG.GEMINI_API_KEY.trim() === "") {
      console.error("AI Error: GEMINI_API_KEY is not set in AI_CONFIG");
      return "AI service not configured";
    }

    try {
      const conversationHistory = messages.slice(-6).map((msg) => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      const requestBody = {
        contents: [
          {
            role: "user",
            parts: [{ text: AI_CONFIG.MEDICAL_ASSISTANT_PROMPT }],
          },
          {
            role: "model",
            parts: [
              {
                text: "I understand. I will act as a medical AI assistant that helps with symptom analysis and doctor recommendations.",
              },
            ],
          },
          ...conversationHistory,
          {
            role: "user",
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 200,
        },
      };

      const response = await fetch(`${AI_CONFIG.API_URL}?key=${AI_CONFIG.GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} - ${errorData?.error?.message || "Unknown error"}`);
      }

      const data = await response.json();
      const aiText =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I couldn't generate a response. Please try again.";
      return aiText;
    } catch (error: any) {
      if (error.message?.includes("API key") || error.message?.includes("401") || error.message?.includes("403")) {
        return "API key error: " + error.message;
      }
      return "Error: " + error.message + ". Please try again or consult a doctor directly.";
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    const aiResponseText = await generateAIResponse(userMessage.text);

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: aiResponseText,
      sender: "ai",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);
    setLoading(false);
  };

  const clearChat = () => {
    Alert.alert("Clear Chat", "Are you sure you want to clear all messages?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          setMessages([
            {
              id: "1",
              text: "Hello! I'm your AI Medical Assistant. How can I help you today?",
              sender: "ai",
              timestamp: new Date(),
            },
          ]);
        },
      },
    ]);
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === "user";

    return (
      <Animated.View
        key={message.id}
        className={`mb-4 flex-row items-end ${isUser ? "justify-end" : "justify-start"}`}
        style={{ opacity: fadeAnim }}
      >
        {!isUser && (
          <LinearGradient colors={[theme.colors.primary, "#60a5fa"]} className="mr-2.5 h-9 w-9 items-center justify-center rounded-full shadow">
            <MaterialCommunityIcons name="robot-happy" size={20} color="#fff" />
          </LinearGradient>
        )}

        <View
          className={`${isUser ? "rounded-br-md bg-blue-600" : "rounded-bl-md bg-white"} rounded-[20px] p-3.5 shadow`}
          style={{ maxWidth: SCREEN_WIDTH * 0.7 }}
        >
          <Text className={`text-[15px] leading-[22px] ${isUser ? "text-white" : "text-slate-800"}`}>{message.text}</Text>
          <Text className={`mt-1.5 text-right text-[10px] ${isUser ? "text-white/70" : "text-slate-400"}`}>
            {formatTime(message.timestamp)}
          </Text>
        </View>

        {isUser && (
          <LinearGradient colors={["#10b981", "#059669"]} className="ml-2.5 h-8 w-8 items-center justify-center rounded-full">
            <Ionicons name="person" size={18} color="#fff" />
          </LinearGradient>
        )}
      </Animated.View>
    );
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <LinearGradient
        colors={[theme.colors.primary, "#2563eb"]}
        className="flex-row items-center justify-between px-4 pb-4"
        style={{
          paddingTop:
            Platform.OS === "ios"
              ? 50
              : StatusBar.currentHeight
                ? StatusBar.currentHeight + 10
                : 40,
        }}
      >
        <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-white/20" onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color="#fff" />
        </TouchableOpacity>

        <View className="ml-3 flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <MaterialCommunityIcons name="robot-happy" size={22} color="#fff" />
          </View>
          <View>
            <Text className="text-lg font-bold text-white">AI Medical Assistant</Text>
            <Text className="mt-0.5 text-xs text-white/80">{loading ? "Thinking..." : "Online • Ready to help"}</Text>
          </View>
        </View>

        <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-white/20" onPress={clearChat} activeOpacity={0.7}>
          <Ionicons name="refresh-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerClassName="p-4 pb-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {messages.map(renderMessage)}

          {loading && (
            <View className="mb-4 flex-row items-end">
              <LinearGradient colors={[theme.colors.primary, "#60a5fa"]} className="mr-2.5 h-9 w-9 items-center justify-center rounded-full shadow">
                <MaterialCommunityIcons name="robot-happy" size={20} color="#fff" />
              </LinearGradient>
              <View className="rounded-[20px] rounded-bl-md bg-white p-3.5 shadow">
                <View className="flex-row items-center gap-2.5">
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                  <Text className="text-sm italic text-slate-500">Analyzing symptoms...</Text>
                </View>
              </View>
            </View>
          )}

          {!loading && messages.length <= 2 && (
            <View className="mt-4 border-t border-slate-200 pt-4">
              <Text className="mb-3 ml-1 text-[13px] text-slate-500">Quick suggestions:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2 pr-4">
                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    className="mr-2 rounded-full border border-blue-600 bg-white px-4 py-2.5"
                    onPress={() => setInputText(suggestion)}
                    activeOpacity={0.7}
                  >
                    <Text className="text-[13px] font-medium text-blue-600">{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>

        <View className="border-t border-slate-200 bg-white px-4 py-3">
          <View className="flex-row items-end gap-2.5">
            <TextInput
              className="max-h-[120px] flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-[15px] text-slate-800"
              placeholder="Describe your symptoms..."
              placeholderTextColor={theme.colors.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              className={`h-12 w-12 overflow-hidden rounded-full ${inputText.trim() === "" || loading ? "opacity-70" : ""}`}
              onPress={handleSend}
              disabled={inputText.trim() === "" || loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  inputText.trim() === "" || loading
                    ? ["#d1d5db", "#9ca3af"]
                    : [theme.colors.primary, "#2563eb"]
                }
                className="h-full w-full items-center justify-center"
              >
                <Ionicons name="send" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center justify-center gap-2 border-t border-slate-200 bg-blue-50 px-4 py-2.5" style={{ paddingBottom: 90 }}>
          <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary} />
          <Text className="text-center text-[11px] text-slate-500">
            AI suggestions only • Always consult a real doctor for medical advice
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
