import { auth, db } from "@/firebaseConfig";
import { Slot } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import BottomNav from "../../ButtonNav/components";
import DoctorBottomNav from "../../DoctorBottomNav/doctorComponents";

export default function TabsLayout() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const userRef = ref(db, `doctors/${uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setRole(data.role || "doctor"); // default to doctor
      } else {
        setRole("patient");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      <Slot />
      {/* Conditional Bottom Nav */}
      {role === "doctor" ? <DoctorBottomNav /> : <BottomNav />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});
