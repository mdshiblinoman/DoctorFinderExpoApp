// components/BottomNav.tsx
import { auth, db } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View className="flex-row justify-around bg-[#fffefeff] py-3 border-t border-[#fdfcfcff] absolute bottom-0 w-full z-[100]">
      <TouchableOpacity className="flex-1 items-center" onPress={() => router.push("/Home/(tabs)/home")}>
        <Text className="text-base font-bold text-[#007bff]">Home</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 items-center" onPress={() => router.push("/Hospital/hospitals")}>
        <Text className="text-base font-bold text-[#007bff]">Hospital</Text>
      </TouchableOpacity>

      <TouchableOpacity className="flex-1 items-center" onPress={() => router.push("/Department/department")}>
        <Text className="text-base font-bold text-[#007bff]">Department</Text>
      </TouchableOpacity>

      {role === "doctor" && (
        <TouchableOpacity className="flex-1 items-center" onPress={() => router.push("/Doctor/doctorHome")}>
          <Text className="text-base font-bold text-[#007bff]">Profile</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
