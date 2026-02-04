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
  StyleSheet,
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
    <View style={styles.infoRow}>
      <View style={styles.infoIconContainer}>
        <Ionicons name={icon as any} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || "Not provided"}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackButton title="My Profile" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Loading your profile...</Text>
          </View>
        ) : doctor ? (
          <>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <LinearGradient
                colors={theme.colors.gradientPrimary}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatarText}>
                  {doctor.name?.charAt(0)?.toUpperCase() || "D"}
                </Text>
              </LinearGradient>
              <Text style={styles.doctorName}>Dr. {doctor.name}</Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.sectionTitle}>Personal Information</Text>
              <InfoRow icon="mail-outline" label="Email" value={doctor.email} />
              <InfoRow icon="call-outline" label="Phone" value={doctor.phone} />
              <InfoRow icon="medical-outline" label="Department" value={doctor.department} />
              <InfoRow icon="business-outline" label="Hospital" value={doctor.hospital} />
              <InfoRow icon="school-outline" label="Degree" value={doctor.degree} />
              <InfoRow icon="time-outline" label="Appointment Time" value={doctor.appointmentTime} />
              <InfoRow icon="location-outline" label="Chamber / Place" value={doctor.place} />
            </View>

            {/* Action Buttons */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
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
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="create-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
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
                  style={styles.actionButtonGradient}
                >
                  <Ionicons name="calendar-outline" size={20} color="#fff" />
                  <Text style={styles.actionButtonText}>View Bookings</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleDelete}
                activeOpacity={0.8}
              >
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.center}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.colors.textSecondary} />
            <Text style={styles.emptyText}>No doctor information found.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 80,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  emptyText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: theme.spacing.lg,
  },
  avatarGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.md,
    ...theme.shadowLarge,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "700",
    color: "#fff",
  },
  doctorName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.secondary,
    marginRight: theme.spacing.xs,
  },
  statusText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.secondary,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.text,
  },
  actionsContainer: {
    gap: theme.spacing.sm,
  },
  actionButton: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    ...theme.shadow,
  },
  actionButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "700",
    color: "#fff",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.error,
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  deleteButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: "600",
    color: theme.colors.error,
  },
});
