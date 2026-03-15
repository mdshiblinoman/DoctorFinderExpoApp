import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

export default function HospitalDoctors() {
  const { hospital } = useLocalSearchParams();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();

  let numColumns = 1;
  if (width >= 1200) numColumns = 4;
  else if (width >= 768) numColumns = 3;

  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const filtered = Object.values<any>(data).filter(
          (doc) =>
            String(doc.hospital ?? "").trim().toLowerCase() ===
            String(hospital ?? "").trim().toLowerCase()
        );
        setDoctors(filtered);
      } else {
        setDoctors([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hospital]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-sm text-slate-500">Loading doctors...</Text>
      </View>
    );
  }

  const renderDoctorCard = ({ item }: { item: any }) => (
    <View
      className="bg-white p-6 rounded-2xl mb-4 items-center"
      style={[theme.shadow, numColumns > 1 ? { width: `${100 / numColumns - 2}%` } : undefined]}
    >
      <View className="relative mb-4">
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} className="w-[70px] h-[70px] rounded-full" />
        ) : (
          <LinearGradient colors={theme.colors.gradientPrimary} className="w-[70px] h-[70px] rounded-full items-center justify-center">
            <Text className="text-2xl font-bold text-white">{item.name?.charAt(0)?.toUpperCase() || "D"}</Text>
          </LinearGradient>
        )}
        <View className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
      </View>

      <Text className="text-base font-bold text-slate-800 text-center mb-1">Dr. {item.name}</Text>

      <View className="flex-row items-center gap-1 mt-0.5">
        <Ionicons name="school-outline" size={14} color={theme.colors.textSecondary} />
        <Text className="text-xs text-slate-500 text-center" numberOfLines={1}>{item.degree}</Text>
      </View>

      <View className="flex-row items-center gap-1 mt-0.5">
        <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
        <Text className="text-xs text-slate-500 text-center" numberOfLines={1}>{item.department}</Text>
      </View>

      <View className="flex-row w-full mt-4 gap-2">
        <TouchableOpacity
          className="flex-1 py-2 rounded-xl items-center border border-blue-500"
          onPress={() =>
            router.push({
              pathname: "/Home/doctorDetails",
              params: { uid: item.uid },
            })
          }
          activeOpacity={0.7}
        >
          <Text className="text-xs font-semibold text-blue-500">Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 rounded-xl overflow-hidden"
          onPress={() =>
            router.push({
              pathname: "/Booking/booking",
              params: {
                uid: item.uid,
                name: item.name,
                hospital: item.hospital,
                department: item.department,
              },
            })
          }
          activeOpacity={0.8}
        >
          <LinearGradient colors={theme.colors.gradientSecondary} className="py-2 items-center">
            <Text className="text-xs font-semibold text-white">Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <BackButton title={`Doctors at ${hospital}`} />

      {doctors.length === 0 ? (
        <View className="flex-1 justify-center items-center p-8">
          <Ionicons name="people-outline" size={60} color={theme.colors.textLight} />
          <Text className="text-lg font-bold text-slate-800 mt-4 mb-1">No Doctors Found</Text>
          <Text className="text-sm text-slate-500 text-center">No doctors are currently available in this hospital</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={numColumns > 1 ? { justifyContent: "space-between" } : undefined}
          contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: theme.spacing.xxl }}
          keyExtractor={(item: any, index) => item.uid || index.toString()}
          renderItem={renderDoctorCard}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
