import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";

interface BackButtonProps {
    title?: string;
    onPress?: () => void;
}

export default function BackButton({ title, onPress }: BackButtonProps) {
    const handlePress = () => {
        if (onPress) {
            onPress();
        } else if (router.canGoBack()) {
            router.back();
        } else {
            router.push("/screen/first");
        }
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={handlePress} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
            </TouchableOpacity>
            {title && <Text style={styles.headerTitle}>{title}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 16,
        paddingBottom: 10,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e0e0e0",
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
        flex: 1,
    },
});
