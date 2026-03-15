import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, StatusBar, TouchableOpacity, View, Text } from "react-native";

interface BackButtonProps {
    title?: string;
    onPress?: () => void;
    variant?: 'light' | 'gradient';
}

export default function BackButton({ title, onPress, variant = 'gradient' }: BackButtonProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.push("/screen/first");
        }
    };

    if (variant === 'light') {
        return (
            <View
                className="flex-row items-center px-4 pb-4 bg-white border-b border-slate-200"
                style={{ paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }}
            >
                <TouchableOpacity onPress={handlePress} className="w-10 h-10 rounded-full bg-slate-50 justify-center items-center" activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                {title && <Text className="flex-1 text-lg font-bold text-slate-800 text-center mx-2">{title}</Text>}
                <View className="w-10" />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="flex-row items-center px-4 pb-4"
            style={{ paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }}
        >
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <TouchableOpacity onPress={handlePress} className="w-10 h-10 rounded-full bg-white/20 justify-center items-center" activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
            {title && <Text className="flex-1 text-lg font-bold text-white text-center mx-2">{title}</Text>}
            <View className="w-10" />
        </LinearGradient>
    );
}
