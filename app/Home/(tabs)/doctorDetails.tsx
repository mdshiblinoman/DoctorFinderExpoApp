import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function DoctorDetails() {
  const { uid } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const calculateAge = (dob: string) => {
    if (!dob) return "-";
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    if (!uid) return;
    const fetchDoctor = async () => {
      try {
        const snapshot = await get(ref(db, "doctors/" + uid));
        if (snapshot.exists()) {
          setDoctor(snapshot.val());
        }
      } catch (error) {
        console.error("Error fetching doctor details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [uid]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-base text-blue-600">Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text className="mt-4 text-lg text-rose-500">Doctor not found</Text>
      </View>
    );
  }

  const infoFields = [
    { label: "Phone", value: doctor.phone, icon: "call-outline" },
    { label: "Email", value: doctor.email, icon: "mail-outline" },
    { label: "Degree", value: doctor.degree, icon: "school-outline" },
    { label: "Department", value: doctor.department, icon: "medical-outline" },
    { label: "Hospital", value: doctor.hospital, icon: "business-outline" },
    { label: "Chamber/Place", value: doctor.place, icon: "location-outline" },
    { label: "Appointment Time", value: doctor.appointmentTime, icon: "time-outline" },
    { label: "Status", value: doctor.status, icon: "checkmark-circle-outline" },
    { label: "Age", value: calculateAge(doctor.dob), icon: "calendar-outline" },
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <BackButton title="Doctor Details" />

      <ScrollView
        className="flex-1"
        contentContainerClassName="pb-24"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View className="mx-4 mt-4 items-center rounded-3xl bg-white px-6 py-8 shadow">
          <View className="relative mb-4">
            <Image
              source={{ uri: doctor.photoURL || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" }}
              className="h-[120px] w-[120px] rounded-full border-4 border-blue-100"
            />
            <View style={[
              { position: "absolute", bottom: 8, right: 8, width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: theme.colors.surface },
              { backgroundColor: doctor.status === 'active' ? theme.colors.success : theme.colors.warning }
            ]} />
          </View>

          <Text className="mb-1 text-3xl font-bold text-slate-800">{doctor.name}</Text>
          <Text className="mb-4 text-base text-slate-500">{doctor.degree}</Text>

          <View className="flex-row flex-wrap justify-center gap-2">
            <View className="flex-row items-center gap-1 rounded-full bg-slate-50 px-4 py-2">
              <Ionicons name="medical-outline" size={14} color={theme.colors.primary} />
              <Text className="text-sm font-semibold text-blue-600">{doctor.department}</Text>
            </View>
            <View className="flex-row items-center gap-1 rounded-full bg-slate-50 px-4 py-2">
              <Ionicons name="business-outline" size={14} color={theme.colors.secondary} />
              <Text style={{ color: theme.colors.secondary }} className="text-sm font-semibold">{doctor.hospital}</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View className="p-4">
          <Text className="mb-4 ml-1 text-2xl font-bold text-slate-800">Information</Text>

          {infoFields.map((field, index) => (
            field.value && (
              <View key={index} className="mb-2 flex-row items-center rounded-xl bg-white p-4 shadow">
                <View className="mr-4 h-11 w-11 items-center justify-center rounded-full bg-slate-50">
                  <Ionicons name={field.icon as any} size={22} color={theme.colors.primary} />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-sm text-slate-500">{field.label}</Text>
                  <Text className="text-base font-semibold text-slate-800">{field.value}</Text>
                </View>
              </View>
            )
          ))}
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity
          className="mx-4 my-6 overflow-hidden rounded-2xl shadow-lg"
          onPress={() =>
            router.push({
              pathname: "/Booking/booking",
              params: {
                uid: doctor.uid,
                name: doctor.name,
                hospital: doctor.hospital,
                department: doctor.department,
              },
            })
          }
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.colors.gradientSecondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="flex-row items-center justify-center gap-2 py-5"
          >
            <Ionicons name="calendar-outline" size={22} color="#fff" />
            <Text className="text-lg font-bold text-white">Book Appointment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
