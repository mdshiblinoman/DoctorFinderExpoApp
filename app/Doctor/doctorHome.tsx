import { theme } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { onValue, ref, remove } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../ButtonNav/components";

export default function DoctorHome() {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const doctorRef = ref(db, `doctors/${uid}`);
    const unsubscribe = onValue(doctorRef, (snapshot) => {
      setDoctor(snapshot.exists() ? snapshot.val() : null);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleDelete = () => {
    if (!uid) return;

    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(ref(db, `doctors/${uid}`));
              Alert.alert("Success", "Your account has been deleted.");
              router.replace("/screen/login");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  const InfoRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View className="flex-row items-center border-b border-slate-200 py-3">
      <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-slate-50">
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="mb-0.5 text-xs text-slate-500">{label}</Text>
        <Text className="text-base font-semibold text-slate-800">{value || "Not provided"}</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-slate-50">
      <BackButton title="My Profile" />
      <ScrollView
        contentContainerClassName="flex-grow px-4 pt-4 pb-28"
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View className="mt-20 flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text className="mt-4 text-base text-slate-500">Loading your profile...</Text>
          </View>
        ) : doctor ? (
          <>
            {/* Profile Header */}
            <View className="mb-6 items-center">
              <LinearGradient
                colors={theme.colors.gradientPrimary}
                className="mb-4 h-[100px] w-[100px] items-center justify-center rounded-full"
              >
                <Text className="text-[40px] font-bold text-white">
                  {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                </Text>
              </LinearGradient>
              <Text className="mb-1 text-3xl font-bold text-slate-800">Dr. {doctor.name}</Text>
              <View className="flex-row items-center rounded-full bg-emerald-100 px-4 py-1">
                <View className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500" />
                <Text className="text-sm font-semibold text-emerald-600">Active</Text>
              </View>
            </View>

            {/* Info Card */}
            <View className="mb-6 rounded-2xl bg-white p-5 shadow">
              <Text className="mb-4 text-lg font-bold text-slate-800">Personal Information</Text>
              <InfoRow icon="mail-outline" label="Email" value={doctor.email} />
              <InfoRow icon="call-outline" label="Phone" value={doctor.phone} />
              <InfoRow icon="medical-outline" label="Department" value={doctor.department} />
              <InfoRow icon="business-outline" label="Hospital" value={doctor.hospital} />
              <InfoRow icon="school-outline" label="Degree" value={doctor.degree} />
              <InfoRow icon="time-outline" label="Appointment Time" value={doctor.appointmentTime} />
              <InfoRow icon="location-outline" label="Chamber / Place" value={doctor.place} />
            </View>

            {/* Action Buttons */}
            <View className="gap-2">
              <TouchableOpacity
                className="overflow-hidden rounded-2xl shadow"
                onPress={() =>
                  router.push({
                    pathname: "/Doctor/editDoctor",
                    params: { uid },
                  })
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={theme.colors.gradientPrimary}
                  className="flex-row items-center justify-center gap-2 py-4"
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text className="text-base font-bold text-white">Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                className="overflow-hidden rounded-2xl shadow"
                onPress={() =>
                  router.push({
                    pathname: "/Doctor/booking",
                    params: { doctorId: uid },
                  })
                }
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={theme.colors.gradientSecondary}
                  className="flex-row items-center justify-center gap-2 py-4"
                >
                  <Ionicons name="calendar-outline" size={20} color="#fff" />
                  <Text className="text-base font-bold text-white">View Bookings</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl border border-rose-500 py-4"
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <Text className="text-base font-semibold text-rose-500">Delete Account</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View className="mt-20 flex-1 items-center justify-center">
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
            <Text className="mt-4 text-base text-slate-500">No doctor information found.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}
