import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Platform, StatusBar, StyleSheet, TouchableOpacity, View, Text } from "react-native";

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
            <View style={styles.headerLight}>
                <TouchableOpacity onPress={handlePress} style={styles.backButtonLight} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
                </TouchableOpacity>
                {title && <Text style={styles.headerTitleLight}>{title}</Text>}
                <View style={styles.placeholder} />
            </View>
        );
    }

    return (
        <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
        >
            <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
            <TouchableOpacity onPress={handlePress} style={styles.backButton} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={26} color="#fff" />
            </TouchableOpacity>
            {title && <Text style={styles.headerTitle}>{title}</Text>}
            <View style={styles.placeholder} />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
    },
    headerLight: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
        paddingHorizontal: theme.spacing.md,
        paddingBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center",
        alignItems: "center",
    },
    backButtonLight: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        flex: 1,
        fontSize: theme.fontSize.xl,
        fontWeight: "700",
        color: "#fff",
        textAlign: "center",
        marginHorizontal: theme.spacing.sm,
    },
    headerTitleLight: {
        flex: 1,
        fontSize: theme.fontSize.xl,
        fontWeight: "700",
        color: theme.colors.text,
        textAlign: "center",
        marginHorizontal: theme.spacing.sm,
    },
    placeholder: {
        width: 40,
    },
});
