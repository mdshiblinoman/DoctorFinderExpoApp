// components/BottomNav.tsx
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BottomNav() {
  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Home/(tabs)/home")}>
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Department/department")}>
        <Text style={styles.navText}>Department</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Hospital/hospitals")}>
        <Text style={styles.navText}>Hospital</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffffff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#ffffffff",

    // Fixed at bottom
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 100,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
  },
  navText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0831e9ff",
  },
});

