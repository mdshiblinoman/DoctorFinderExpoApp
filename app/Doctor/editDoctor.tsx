// app/doctorEdit.tsx
import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const fieldIcons: Record<string, string> = {
  name: "person-outline",
  phone: "call-outline",
  email: "mail-outline",
  department: "medical-outline",
  hospital: "business-outline",
  degree: "school-outline",
  appointmentTime: "time-outline",
  place: "location-outline",
  registrationNumber: "card-outline",
  dob: "calendar-outline",
  age: "hourglass-outline",
  role: "shield-outline",
  status: "checkmark-circle-outline",
};

export default function DoctorEdit() {
  const { uid } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<any>({
    name: "",
    phone: "",
    email: "",
    department: "",
    hospital: "",
    degree: "",
    appointmentTime: "",
    place: "",
    registrationNumber: "",
    dob: "",
    age: "",
    role: "doctor",
    status: "active",
  });

  // Calculate age from DOB
  const calculateAge = (dob: string) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    const diff = Date.now() - birthDate.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  };

  useEffect(() => {
    if (!uid) return;

    const docRef = ref(db, `doctors/${uid}`);
    const unsubscribe = onValue(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setDoctor(data);

        const keysInSequence = [
          "name",
          "phone",
          "email",
          "department",
          "hospital",
          "degree",
          "appointmentTime",
          "place",
          "registrationNumber",
          "dob",
          "age",
          "role",
          "status",
        ];

        const filteredData: any = {};
        keysInSequence.forEach((key) => {
          filteredData[key] = data[key] || "";
        });

        // Auto calculate age from dob
        filteredData.age = calculateAge(filteredData.dob);

        setForm(filteredData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  const handleChange = (key: string, value: string) => {
    setForm({ ...form, [key]: value });
    if (key === "dob") {
      setForm((prev: any) => ({ ...prev, age: calculateAge(value) }));
    }
  };

  const handleUpdate = async () => {
    if (!uid) return;
    try {
      setSaving(true);
      // Editable fields: including name now
      const editableFields = [
        "name",
        "phone",
        "email",
        "hospital",
        "degree",
        "appointmentTime",
        "place",
      ];
      const updateData: any = {};
      editableFields.forEach((key) => {
        updateData[key] = form[key];
      });

      await update(ref(db, `doctors/${uid}`), updateData);
      Alert.alert("Success", "Your profile has been updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-base text-slate-500">Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
        <Text className="mt-4 text-base text-slate-500">No doctor found</Text>
      </View>
    );
  }

  const fieldLabels: any = {
    name: "Full Name",
    phone: "Phone Number",
    email: "Email Address",
    department: "Department",
    hospital: "Hospital",
    degree: "Degree / Qualification",
    appointmentTime: "Appointment Hours",
    place: "Chamber / Place",
    registrationNumber: "Registration No",
    dob: "Date of Birth",
    age: "Age",
    role: "Role",
    status: "Status",
  };

  const readOnlyFields = [
    "department",
    "registrationNumber",
    "dob",
    "age",
    "role",
    "status",
  ];

  return (
    <View className="flex-1 bg-slate-50">
      <BackButton title="Edit Profile" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="px-4 pb-16"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="mb-1 text-2xl font-bold text-slate-800">Editable Fields</Text>
          <Text className="mb-6 text-sm text-slate-500">Update your profile information below</Text>

          {Object.keys(form).map((key) => {
            const isReadOnly = readOnlyFields.includes(key);
            return (
              <View key={key} className="mb-4">
                <Text className="mb-1 text-sm font-semibold text-slate-800">
                  {fieldLabels[key]}
                  {isReadOnly && <Text className="text-xs font-normal text-slate-400"> (Read-only)</Text>}
                </Text>
                <View className="flex-row items-center rounded-xl border px-4" style={{ backgroundColor: isReadOnly ? theme.colors.background : theme.colors.surface, borderColor: theme.colors.border }}>
                  <Ionicons
                    name={fieldIcons[key] as any || "document-text-outline"}
                    size={20}
                    color={isReadOnly ? theme.colors.textLight : theme.colors.textSecondary}
                  />
                  <TextInput
                    className={`flex-1 px-2 py-4 text-base ${isReadOnly ? "text-slate-500" : "text-slate-800"}`}
                    value={form[key]}
                    onChangeText={(val) => handleChange(key, val)}
                    placeholder={`Enter ${fieldLabels[key]}`}
                    placeholderTextColor={theme.colors.textLight}
                    editable={!isReadOnly}
                  />
                  {isReadOnly && (
                    <Ionicons name="lock-closed-outline" size={16} color={theme.colors.textLight} />
                  )}
                </View>
              </View>
            );
          })}

          <TouchableOpacity
            className={`mt-6 overflow-hidden rounded-2xl shadow-lg ${saving ? "opacity-70" : ""}`}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center gap-2 py-5"
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text className="text-lg font-bold text-white">
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
