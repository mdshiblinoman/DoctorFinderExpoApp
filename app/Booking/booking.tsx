import { theme } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import { onValue, push, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingScreen() {
  const { uid } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);

  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const doctorRef = ref(db, `doctors/${uid}`);
    onValue(doctorRef, (snapshot) => {
      if (snapshot.exists()) setDoctor(snapshot.val());
    });
  }, [uid]);

  const handleSubmit = async () => {
    const emailToUse = email.trim() || auth.currentUser?.email || "";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!patientName || !phone || !age || !reason || !emailToUse || !emailRegex.test(emailToUse)) {
      Alert.alert("Error", "Please fill all fields with valid information.");
      return;
    }
    try {
      setLoading(true);
      const bookingRef = ref(db, `bookings/${uid}`);
      const newBookingRef = push(bookingRef);
      await set(newBookingRef, {
        patientName,
        phone,
        age,
        reason,
        email: emailToUse,
        doctorName: doctor?.name ?? "",
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      Alert.alert("Success", "Your appointment request has been sent!");
      setPatientName("");
      setPhone("");
      setAge("");
      setEmail("");
      setReason("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    setter(value.replace(/[^0-9]/g, ""));
  };

  const allFilled = patientName && phone && age && reason && (email.trim() || auth.currentUser?.email);

  return (
    <View className="flex-1 bg-slate-50">
      <BackButton title="Book Appointment" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="px-4 pb-16"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Doctor Card */}
          {doctor && (
            <View className="mb-6 flex-row items-center rounded-2xl bg-white p-5 shadow">
              <View className="mr-4 h-14 w-14 items-center justify-center rounded-full bg-slate-50">
                <Ionicons name="medical" size={28} color={theme.colors.primary} />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-2xl font-bold text-slate-800">Dr. {doctor.name}</Text>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
                  <Text className="text-sm text-slate-500">{doctor.hospital}</Text>
                </View>
                <View className="mt-0.5 flex-row items-center gap-1">
                  <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
                  <Text className="text-sm text-slate-500">{doctor.department}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View className="mb-6">
            <Text className="mb-4 text-2xl font-bold text-slate-800">Patient Information</Text>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-slate-800">Full Name *</Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4">
                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  placeholder="Enter patient name"
                  placeholderTextColor={theme.colors.textLight}
                  className="flex-1 px-2 py-4 text-base text-slate-800"
                  value={patientName}
                  onChangeText={setPatientName}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-slate-800">Email Address *</Text>
              <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4">
                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor={theme.colors.textLight}
                  className="flex-1 px-2 py-4 text-base text-slate-800"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View className="flex-row">
              <View className="mb-4 mr-2 flex-1">
                <Text className="mb-1 text-sm font-semibold text-slate-800">Phone *</Text>
                <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4">
                  <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    placeholder="Phone number"
                    placeholderTextColor={theme.colors.textLight}
                    className="flex-1 px-2 py-4 text-base text-slate-800"
                    keyboardType="numeric"
                    value={phone}
                    onChangeText={(val) => handleNumericInput(val, setPhone)}
                  />
                </View>
              </View>

              <View className="mb-4 flex-1">
                <Text className="mb-1 text-sm font-semibold text-slate-800">Age *</Text>
                <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4">
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    placeholder="Age"
                    placeholderTextColor={theme.colors.textLight}
                    className="flex-1 px-2 py-4 text-base text-slate-800"
                    keyboardType="numeric"
                    value={age}
                    onChangeText={(val) => handleNumericInput(val, setAge)}
                  />
                </View>
              </View>
            </View>

            <View className="mb-4">
              <Text className="mb-1 text-sm font-semibold text-slate-800">Reason / Symptoms *</Text>
              <View className="rounded-xl border border-slate-200 bg-white px-4 pt-4">
                <TextInput
                  placeholder="Describe your symptoms or reason for visit..."
                  placeholderTextColor={theme.colors.textLight}
                  className="h-24 px-2 pb-4 text-base text-slate-800"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={reason}
                  onChangeText={setReason}
                />
              </View>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            className={`mt-4 overflow-hidden rounded-2xl shadow-lg ${(!allFilled || loading) ? "opacity-70" : ""}`}
            disabled={!allFilled || loading}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={allFilled && !loading ? theme.colors.gradientSecondary : ['#d1d5db', '#9ca3af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center gap-2 py-5"
            >
              <Ionicons name="calendar-outline" size={22} color="#fff" />
              <Text className="text-lg font-bold text-white">
                {loading ? "Submitting..." : "Submit Booking"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
