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
  StyleSheet,
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
    <View style={styles.container}>
      <BackButton title="Book Appointment" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Doctor Card */}
          {doctor && (
            <View style={styles.doctorCard}>
              <View style={styles.doctorIconContainer}>
                <Ionicons name="medical" size={28} color={theme.colors.primary} />
              </View>
              <View style={styles.doctorInfo}>
                <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
                <View style={styles.doctorDetail}>
                  <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.doctorDetailText}>{doctor.hospital}</Text>
                </View>
                <View style={styles.doctorDetail}>
                  <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.doctorDetailText}>{doctor.department}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Form Fields */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Patient Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  placeholder="Enter patient name"
                  placeholderTextColor={theme.colors.textLight}
                  style={styles.input}
                  value={patientName}
                  onChangeText={setPatientName}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
                <TextInput
                  placeholder="Enter email"
                  placeholderTextColor={theme.colors.textLight}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: theme.spacing.sm }]}>
                <Text style={styles.inputLabel}>Phone *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="call-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    placeholder="Phone number"
                    placeholderTextColor={theme.colors.textLight}
                    style={styles.input}
                    keyboardType="numeric"
                    value={phone}
                    onChangeText={(val) => handleNumericInput(val, setPhone)}
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Age *</Text>
                <View style={styles.inputContainer}>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                  <TextInput
                    placeholder="Age"
                    placeholderTextColor={theme.colors.textLight}
                    style={styles.input}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={(val) => handleNumericInput(val, setAge)}
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Reason / Symptoms *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <TextInput
                  placeholder="Describe your symptoms or reason for visit..."
                  placeholderTextColor={theme.colors.textLight}
                  style={[styles.input, styles.textArea]}
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
            style={[styles.submitButton, (!allFilled || loading) && styles.submitButtonDisabled]}
            disabled={!allFilled || loading}
            onPress={handleSubmit}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={allFilled && !loading ? theme.colors.gradientSecondary : ['#d1d5db', '#9ca3af']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.submitButtonGradient}
            >
              <Ionicons name="calendar-outline" size={22} color="#fff" />
              <Text style={styles.submitButtonText}>
                {loading ? "Submitting..." : "Submit Booking"}
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
  doctorCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  doctorIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  doctorDetail: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  doctorDetailText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  formSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  textAreaContainer: {
    alignItems: "flex-start",
    paddingTop: theme.spacing.md,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    height: 100,
    paddingTop: 0,
  },
  rowInputs: {
    flexDirection: "row",
  },
  submitButton: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    marginTop: theme.spacing.md,
    ...theme.shadowLarge,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  submitButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: "#fff",
  },
});
