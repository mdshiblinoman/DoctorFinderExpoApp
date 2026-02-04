import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, router } from "expo-router";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={theme.colors.error} />
        <Text style={styles.errorText}>Doctor not found</Text>
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
    <View style={styles.container}>
      <BackButton title="Doctor Details" />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: doctor.photoURL || "https://cdn-icons-png.flaticon.com/512/3774/3774299.png" }}
              style={styles.avatar}
            />
            <View style={[
              styles.statusIndicator,
              { backgroundColor: doctor.status === 'active' ? theme.colors.success : theme.colors.warning }
            ]} />
          </View>

          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorDegree}>{doctor.degree}</Text>

          <View style={styles.tagContainer}>
            <View style={styles.tag}>
              <Ionicons name="medical-outline" size={14} color={theme.colors.primary} />
              <Text style={styles.tagText}>{doctor.department}</Text>
            </View>
            <View style={styles.tag}>
              <Ionicons name="business-outline" size={14} color={theme.colors.secondary} />
              <Text style={[styles.tagText, { color: theme.colors.secondary }]}>{doctor.hospital}</Text>
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Information</Text>

          {infoFields.map((field, index) => (
            field.value && (
              <View key={index} style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name={field.icon as any} size={22} color={theme.colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>{field.label}</Text>
                  <Text style={styles.infoValue}>{field.value}</Text>
                </View>
              </View>
            )
          ))}
        </View>

        {/* Book Appointment Button */}
        <TouchableOpacity
          style={styles.bookButton}
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
            style={styles.bookButtonGradient}
          >
            <Ionicons name="calendar-outline" size={22} color="#fff" />
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    color: theme.colors.error,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderRadius: theme.radius.xl,
    ...theme.shadow,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: theme.colors.primaryLight,
  },
  statusIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: theme.colors.surface,
  },
  doctorName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  doctorDegree: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: theme.spacing.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.full,
    gap: theme.spacing.xs,
  },
  tagText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  infoSection: {
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    marginLeft: theme.spacing.xs,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadow,
  },
  infoIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  bookButton: {
    marginHorizontal: theme.spacing.md,
    marginVertical: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    ...theme.shadowLarge,
  },
  bookButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  bookButtonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: "#fff",
  },
});
