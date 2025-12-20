// components/BottomNav.tsx
import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BottomNav() {
  const [role, setRole] = useState<string | null>(null);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) return;

    const userRef = ref(db, `doctors/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) setRole(snapshot.val().role || "doctor");
      else setRole(null);
    });

    return () => unsubscribe();
  }, [uid]);

  return (
    <View style={styles.navBar}>
      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Home/(tabs)/home")}>
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Hospital/hospitals")}>
        <Text style={styles.navText}>Hospital</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Department/department")}>
        <Text style={styles.navText}>Department</Text>
      </TouchableOpacity>

      {role === "doctor" && (
        <TouchableOpacity style={styles.navBtn} onPress={() => router.push("/Doctor/doctorHome")}>
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fffefeff",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: "#fdfcfcff",
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
    color: "#007bff",
  },
});
