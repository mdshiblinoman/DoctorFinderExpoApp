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
    StyleSheet,
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
            text: "👋 Hello! I'm your AI Medical Assistant.\n\nI can help you understand your symptoms and suggest the right specialist doctor. Please describe what you're experiencing.",
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
    }, []);

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

    const handleQuickSuggestion = (suggestion: string) => {
        setInputText(suggestion);
    };

    const renderMessage = (message: Message) => {
        const isUser = message.sender === "user";

        return (
            <Animated.View
                key={message.id}
                style={[
                    styles.messageWrapper,
                    isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
                    { opacity: fadeAnim },
                ]}
            >
                {!isUser && (
                    <LinearGradient
                        colors={[theme.colors.primary, '#60a5fa']}
                        style={styles.aiAvatar}
                    >
                        <MaterialCommunityIcons name="robot-happy" size={20} color="#fff" />
                    </LinearGradient>
                )}
                <View
                    style={[
                        styles.messageBubble,
                        isUser ? styles.userBubble : styles.aiBubble,
                    ]}
                >
                    <Text style={[styles.messageText, isUser ? styles.userText : styles.aiText]}>
                        {message.text}
                    </Text>
                    <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
                        {formatTime(message.timestamp)}
                    </Text>
                </View>
                {isUser && (
                    <LinearGradient
                        colors={['#10b981', '#059669']}
                        style={styles.userAvatar}
                    >
                        <Ionicons name="person" size={18} color="#fff" />
                    </LinearGradient>
                )}
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

            {/* Header */}
            <LinearGradient
                colors={[theme.colors.primary, '#2563eb']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={28} color="#fff" />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <View style={styles.headerIconContainer}>
                        <MaterialCommunityIcons name="robot-happy" size={22} color="#fff" />
                    </View>
                    <View>
                        <Text style={styles.headerTitle}>AI Medical Assistant</Text>
                        <Text style={styles.headerSubtitle}>
                            {loading ? "Thinking..." : "Online • Ready to help"}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearChat}
                    activeOpacity={0.7}
                >
                    <Ionicons name="refresh-outline" size={24} color="#fff" />
                </TouchableOpacity>
            </LinearGradient>

            <KeyboardAvoidingView
                style={styles.keyboardContainer}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
            >
                {/* Chat Messages */}
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.chatContainer}
                    contentContainerStyle={styles.chatContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {messages.map(renderMessage)}

                    {loading && (
                        <View style={[styles.messageWrapper, styles.aiMessageWrapper]}>
                            <LinearGradient
                                colors={[theme.colors.primary, '#60a5fa']}
                                style={styles.aiAvatar}
                            >
                                <MaterialCommunityIcons name="robot-happy" size={20} color="#fff" />
                            </LinearGradient>
                            <View style={styles.typingBubble}>
                                <View style={styles.typingDots}>
                                    <ActivityIndicator size="small" color={theme.colors.primary} />
                                    <Text style={styles.typingText}>Analyzing symptoms...</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* Quick Suggestions - Only show when no loading and few messages */}
                    {!loading && messages.length <= 2 && (
                        <View style={styles.suggestionsContainer}>
                            <Text style={styles.suggestionsTitle}>Quick suggestions:</Text>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.suggestionsScroll}
                            >
                                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.suggestionChip}
                                        onPress={() => handleQuickSuggestion(suggestion)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.suggestionText}>{suggestion}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}
                </ScrollView>

                {/* Input Area */}
                <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.input}
                            placeholder="Describe your symptoms..."
                            placeholderTextColor={theme.colors.muted}
                            value={inputText}
                            onChangeText={setInputText}
                            multiline
                            maxLength={500}
                            editable={!loading}
                        />
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (inputText.trim() === "" || loading) && styles.sendButtonDisabled,
                            ]}
                            onPress={handleSend}
                            disabled={inputText.trim() === "" || loading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={inputText.trim() === "" || loading
                                    ? ['#d1d5db', '#9ca3af']
                                    : [theme.colors.primary, '#2563eb']}
                                style={styles.sendButtonGradient}
                            >
                                <Ionicons
                                    name="send"
                                    size={20}
                                    color="#fff"
                                />
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Disclaimer */}
                <View style={styles.disclaimer}>
                    <Ionicons name="shield-checkmark" size={14} color={theme.colors.primary} />
                    <Text style={styles.disclaimerText}>
                        AI suggestions only • Always consult a real doctor for medical advice
                    </Text>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        paddingTop: Platform.OS === 'ios' ? 50 : StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40,
        paddingBottom: 16,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerCenter: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        marginLeft: 12,
        gap: 12,
    },
    headerIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#fff",
    },
    headerSubtitle: {
        fontSize: 12,
        color: "rgba(255,255,255,0.8)",
        marginTop: 2,
    },
    clearButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    keyboardContainer: {
        flex: 1,
    },
    chatContainer: {
        flex: 1,
    },
    chatContent: {
        padding: 16,
        paddingBottom: 24,
    },
    messageWrapper: {
        flexDirection: "row",
        marginBottom: 16,
        alignItems: "flex-end",
    },
    userMessageWrapper: {
        justifyContent: "flex-end",
    },
    aiMessageWrapper: {
        justifyContent: "flex-start",
    },
    aiAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        ...theme.shadow,
    },
    userAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    messageBubble: {
        maxWidth: SCREEN_WIDTH * 0.7,
        borderRadius: 20,
        padding: 14,
        ...theme.shadow,
    },
    userBubble: {
        backgroundColor: theme.colors.primary,
        borderBottomRightRadius: 6,
    },
    aiBubble: {
        backgroundColor: "#fff",
        borderBottomLeftRadius: 6,
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
    },
    userText: {
        color: "#fff",
    },
    aiText: {
        color: theme.colors.text,
    },
    timestamp: {
        fontSize: 10,
        color: theme.colors.muted,
        marginTop: 6,
        textAlign: "right",
    },
    userTimestamp: {
        color: "rgba(255,255,255,0.7)",
    },
    typingBubble: {
        backgroundColor: "#fff",
        borderRadius: 20,
        borderBottomLeftRadius: 6,
        padding: 14,
        ...theme.shadow,
    },
    typingDots: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    typingText: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        fontStyle: "italic",
    },
    suggestionsContainer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    suggestionsTitle: {
        fontSize: 13,
        color: theme.colors.textSecondary,
        marginBottom: 12,
        marginLeft: 4,
    },
    suggestionsScroll: {
        paddingRight: 16,
        gap: 8,
    },
    suggestionChip: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.primary,
        marginRight: 8,
    },
    suggestionText: {
        fontSize: 13,
        color: theme.colors.primary,
        fontWeight: "500",
    },
    inputContainer: {
        backgroundColor: "#fff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-end",
        gap: 10,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 24,
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 15,
        maxHeight: 120,
        color: theme.colors.text,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        overflow: "hidden",
    },
    sendButtonGradient: {
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    sendButtonDisabled: {
        opacity: 0.7,
    },
    disclaimer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eff6ff",
        paddingVertical: 10,
        paddingHorizontal: 16,
        gap: 8,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    disclaimerText: {
        fontSize: 11,
        color: theme.colors.textSecondary,
        textAlign: "center",
    },
});
