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
  StyleSheet,
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
        <Text style={styles.loadingText}>No doctor found</Text>
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
    <View style={styles.container}>
      <BackButton title="Edit Profile" />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.sectionTitle}>Editable Fields</Text>
          <Text style={styles.sectionSubtitle}>Update your profile information below</Text>

          {Object.keys(form).map((key) => {
            const isReadOnly = readOnlyFields.includes(key);
            return (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {fieldLabels[key]}
                  {isReadOnly && <Text style={styles.readOnlyBadge}> (Read-only)</Text>}
                </Text>
                <View style={[
                  styles.inputContainer,
                  isReadOnly && styles.inputContainerReadOnly
                ]}>
                  <Ionicons
                    name={fieldIcons[key] as any || "document-text-outline"}
                    size={20}
                    color={isReadOnly ? theme.colors.textLight : theme.colors.textSecondary}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      isReadOnly && styles.inputReadOnly,
                    ]}
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
            style={[styles.updateButton, saving && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.updateButtonGradient}
            >
              <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
              <Text style={styles.updateButtonText}>
                {saving ? "Saving..." : "Save Changes"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  readOnlyBadge: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    fontWeight: "400",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputContainerReadOnly: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  inputReadOnly: {
    color: theme.colors.textSecondary,
  },
  updateButton: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginTop: theme.spacing.lg,
    ...theme.shadowLarge,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: theme.fontSize.lg,
  },
});
