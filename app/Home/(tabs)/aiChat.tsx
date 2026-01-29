import { AI_CONFIG } from "@/config/aiConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface Message {
    id: string;
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
}

export default function AIChatScreen() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm your AI Medical Assistant. I can help you understand your symptoms and suggest appropriate doctors. Please describe your symptoms or health concerns.",
            sender: "ai",
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    }, [messages]);

    const generateAIResponse = async (userMessage: string) => {
        // Quick guard: if API key is not set, avoid calling the remote API and return
        // a clear message so developers/users know how to fix configuration.
        if (!AI_CONFIG.OPENROUTER_API_KEY || AI_CONFIG.OPENROUTER_API_KEY.trim() === "") {
            console.error("AI Error: OPENROUTER_API_KEY is not set in AI_CONFIG");
            return "⚠️ AI service not configured. Please set EXPO_PUBLIC_OPENROUTER_API_KEY in your environment (use .env for local dev or Expo `extra`/EAS secrets for production).";
        }

        try {
            // Get previous messages for context, limited to last 5 exchanges
            const contextMessages = messages
                .slice(-10)
                .map(msg => ({
                    role: msg.sender === "user" ? "user" : "assistant",
                    content: msg.text
                }));

            const response = await fetch(AI_CONFIG.API_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${AI_CONFIG.OPENROUTER_API_KEY}`,
                    "HTTP-Referer": AI_CONFIG.SITE_URL,
                    "X-Title": AI_CONFIG.SITE_NAME,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: AI_CONFIG.MODEL,
                    messages: [
                        {
                            role: "system",
                            content: AI_CONFIG.MEDICAL_ASSISTANT_PROMPT
                        },
                        ...contextMessages,
                        {
                            role: "user",
                            content: userMessage
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("API Error:", errorData);
                throw new Error(`API request failed: ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.choices?.[0]?.message?.content || "I couldn't generate a response. Please try again.";
            return aiText;
        } catch (error: any) {
            console.error("AI Error:", error);

            if (error.message?.includes("API key") || error.message?.includes("401")) {
                return "⚠️ AI service configuration error. Please make sure the API key is properly set. Meanwhile, I recommend consulting a doctor directly for your health concerns.";
            }

            return "I apologize, but I'm having trouble processing your request right now. Please try again or consult a doctor directly for your health concerns.";
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

        // Generate AI response
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
        Alert.alert(
            "Clear Chat",
            "Are you sure you want to clear all messages?",
            [
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
            ]
        );
    };

    const formatTime = (date: Date) => {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <Ionicons name="medkit" size={24} color="#fff" />
                    <Text style={styles.headerTitle}>AI Medical Assistant</Text>
                </View>
                <TouchableOpacity style={styles.clearButton} onPress={clearChat}>
                    <Ionicons name="trash-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Chat Messages */}
            <ScrollView
                ref={scrollViewRef}
                style={styles.chatContainer}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
            >
                {messages.map((message) => (
                    <View
                        key={message.id}
                        style={[
                            styles.messageBubble,
                            message.sender === "user"
                                ? styles.userBubble
                                : styles.aiBubble,
                        ]}
                    >
                        {message.sender === "ai" && (
                            <View style={styles.aiIcon}>
                                <Ionicons name="medkit" size={20} color="#007AFF" />
                            </View>
                        )}
                        <View style={styles.messageContent}>
                            <Text
                                style={[
                                    styles.messageText,
                                    message.sender === "user"
                                        ? styles.userText
                                        : styles.aiText,
                                ]}
                            >
                                {message.text}
                            </Text>
                            <Text style={styles.timestamp}>
                                {formatTime(message.timestamp)}
                            </Text>
                        </View>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.messageBubble, styles.aiBubble]}>
                        <View style={styles.aiIcon}>
                            <Ionicons name="medkit" size={20} color="#007AFF" />
                        </View>
                        <View style={styles.typingIndicator}>
                            <ActivityIndicator size="small" color="#007AFF" />
                            <Text style={styles.typingText}>Analyzing...</Text>
                        </View>
                    </View>
                )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.input}
                        placeholder="Describe your symptoms..."
                        placeholderTextColor="#999"
                        value={inputText}
                        onChangeText={setInputText}
                        multiline
                        maxLength={500}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            inputText.trim() === "" && styles.sendButtonDisabled,
                        ]}
                        onPress={handleSend}
                        disabled={inputText.trim() === "" || loading}
                    >
                        <Ionicons
                            name="send"
                            size={24}
                            color={inputText.trim() === "" ? "#ccc" : "#fff"}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Disclaimer */}
            <View style={styles.disclaimer}>
                <Ionicons name="information-circle" size={16} color="#666" />
                <Text style={styles.disclaimerText}>
                    This AI provides suggestions only. Always consult a real doctor.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f7fa",
    },
    header: {
        backgroundColor: "#007AFF",
        paddingTop: 50,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    clearButton: {
        width: 40,
        height: 40,
        justifyContent: "center",
        alignItems: "center",
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
        paddingBottom: 20,
    },
    messageBubble: {
        flexDirection: "row",
        marginBottom: 16,
        maxWidth: "85%",
    },
    userBubble: {
        alignSelf: "flex-end",
        flexDirection: "row-reverse",
    },
    aiBubble: {
        alignSelf: "flex-start",
    },
    aiIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#e3f2fd",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    messageContent: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 20,
    },
    userText: {
        color: "#333",
    },
    aiText: {
        color: "#333",
    },
    timestamp: {
        fontSize: 11,
        color: "#999",
        marginTop: 4,
        textAlign: "right",
    },
    typingIndicator: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        gap: 8,
    },
    typingText: {
        fontSize: 14,
        color: "#666",
        fontStyle: "italic",
    },
    inputContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 15,
        maxHeight: 100,
        color: "#333",
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#007AFF",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#007AFF",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 3,
    },
    sendButtonDisabled: {
        backgroundColor: "#e0e0e0",
    },
    disclaimer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff3cd",
        paddingVertical: 8,
        paddingHorizontal: 16,
        gap: 6,
    },
    disclaimerText: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },
});
