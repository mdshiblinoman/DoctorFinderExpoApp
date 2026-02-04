import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { sendAcceptanceEmail } from "@/services/emailService";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingList() {
  const { doctorId } = useLocalSearchParams();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!doctorId) {
      console.log("No doctorId provided!");
      setLoading(false);
      return;
    }

    const bookingRef = ref(db, `bookings/${doctorId}`);
    const unsubscribe = onValue(bookingRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const list = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (aTime !== 0 || bTime !== 0) return bTime - aTime;
            return b.id.localeCompare(a.id);
          });
        setBookings(list);
      } else {
        setBookings([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [doctorId]);

  const handleAccept = async (item: any) => {
    if (!doctorId || !item.id) return;

    if (item.status === "accepted" || item.status === "rejected") {
      Alert.alert("Notice", "This booking has already been processed.");
      return;
    }

    try {
      const acceptedBookings = bookings.filter((b: any) => b.status === "accepted").length;
      const serialNumber = acceptedBookings + 1;

      const baseTime = new Date();
      baseTime.setHours(9, 0, 0, 0);
      const appointmentTime = new Date(baseTime.getTime() + (serialNumber - 1) * 20 * 60000);

      const hours = appointmentTime.getHours();
      const minutes = appointmentTime.getMinutes();
      const formattedTime = `${hours > 12 ? hours - 12 : hours}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;

      const today = new Date();
      const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      const bookingRef = ref(db, `bookings/${doctorId}/${item.id}`);
      await update(bookingRef, {
        status: "accepted",
        serialNumber,
        appointmentTime: formattedTime,
        appointmentDuration: "20 minutes",
        acceptedAt: new Date().toISOString(),
      });

      if (item.email) {
        const emailData = {
          patientEmail: item.email,
          patientName: item.patientName || "Patient",
          doctorName: item.doctorName || "Doctor",
          doctorDegree: item.doctorDegree || "",
          department: item.department || "General",
          hospital: item.hospitalName || item.hospital || "Hospital",
          appointmentDate: formattedDate,
          appointmentTime: formattedTime,
          appointmentDuration: "20 minutes",
          serialNumber: serialNumber.toString(),
          acceptedAt: new Date().toLocaleString(),
        };

        sendAcceptanceEmail(emailData)
          .then((result: { success: boolean; error?: string }) => {
            if (result.success) {
              console.log("✅ Email notification sent successfully");
            } else {
              console.log("⚠️ Email notification failed:", result.error);
            }
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.log("⚠️ Email error:", errorMessage);
          });
      }

      Alert.alert(
        "Success",
        `Booking accepted!\n\nSerial: ${serialNumber}\nTime: ${formattedTime}\nDuration: 20 minutes${item.email ? '\n\n✅ Email confirmation sent to patient' : ''}`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleReject = (item: any) => {
    if (!doctorId || !item.id) return;

    if (item.status === "accepted" || item.status === "rejected") {
      Alert.alert("Notice", "This booking has already been processed.");
      return;
    }

    Alert.alert(
      "Reject Booking",
      "Are you sure you want to reject this booking?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reject",
          style: "destructive",
          onPress: async () => {
            try {
              const bookingRef = ref(db, `bookings/${doctorId}/${item.id}`);
              await update(bookingRef, {
                status: "rejected",
                rejectedAt: new Date().toISOString(),
              });
              Alert.alert("Rejected", "Booking has been rejected.");
            } catch (error: any) {
              console.log("Reject error:", error.message);
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  const pendingCount = bookings.filter(b => !b.status || b.status === "pending").length;
  const acceptedCount = bookings.filter(b => b.status === "accepted").length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradientPrimary}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Appointment Requests</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{acceptedCount}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{bookings.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={60} color={theme.colors.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No Booking Requests</Text>
            <Text style={styles.emptyText}>
              You don't have any pending appointment requests at the moment.
            </Text>
          </View>
        ) : (
          bookings.map((item: any) => (
            <View key={item.id} style={styles.card}>
              {/* Status Badge */}
              <View style={[
                styles.statusBadge,
                item.status === "accepted" && styles.acceptedBadge,
                item.status === "rejected" && styles.rejectedBadge,
                (!item.status || item.status === "pending") && styles.pendingBadge,
              ]}>
                <Ionicons
                  name={
                    item.status === "accepted" ? "checkmark-circle" :
                      item.status === "rejected" ? "close-circle" : "time-outline"
                  }
                  size={14}
                  color="#fff"
                />
                <Text style={styles.badgeText}>
                  {item.status === "accepted" ? "Accepted" :
                    item.status === "rejected" ? "Rejected" : "Pending"}
                </Text>
              </View>

              {/* Patient Info */}
              <View style={styles.infoSection}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="person" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Patient Name</Text>
                    <Text style={styles.infoValue}>{item.patientName || "N/A"}</Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="call" size={18} color={theme.colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Phone Number</Text>
                    <Text style={styles.infoValue}>{item.phone || "N/A"}</Text>
                  </View>
                </View>

                {item.email && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Ionicons name="mail" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Email Address</Text>
                      <Text style={styles.infoValue}>{item.email}</Text>
                    </View>
                  </View>
                )}

                {item.reason && (
                  <View style={styles.infoRow}>
                    <View style={styles.infoIconContainer}>
                      <Ionicons name="document-text" size={18} color={theme.colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>Reason for Visit</Text>
                      <Text style={styles.infoValue}>{item.reason}</Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Appointment Details (if accepted) */}
              {item.status === "accepted" && (
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="newspaper" size={16} color={theme.colors.secondary} />
                    <Text style={styles.detailLabel}>Serial No:</Text>
                    <Text style={styles.detailValue}>#{item.serialNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={16} color={theme.colors.secondary} />
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{item.appointmentTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="hourglass" size={16} color={theme.colors.secondary} />
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{item.appointmentDuration}</Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              {!item.status || (item.status !== "accepted" && item.status !== "rejected") ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAccept(item)}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={theme.colors.gradientSecondary}
                      style={styles.buttonGradient}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                      <Text style={styles.buttonText}>Accept</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.rejectButton}
                    onPress={() => handleReject(item)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.processedContainer}>
                  <Ionicons
                    name={item.status === "accepted" ? "checkmark-done-circle" : "close-circle"}
                    size={20}
                    color={item.status === "accepted" ? theme.colors.secondary : theme.colors.error}
                  />
                  <Text style={[
                    styles.processedText,
                    { color: item.status === "accepted" ? theme.colors.secondary : theme.colors.error }
                  ]}>
                    This booking has been {item.status}
                  </Text>
                </View>
              )}
            </View>
          ))
        )}
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
    color: theme.colors.textSecondary,
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight! + theme.spacing.md : 60,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    marginTop: theme.spacing.sm,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: "#fff",
  },
  statLabel: {
    fontSize: theme.fontSize.xs,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadow,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginBottom: theme.spacing.md,
    gap: 4,
  },
  acceptedBadge: {
    backgroundColor: theme.colors.secondary,
  },
  rejectedBadge: {
    backgroundColor: theme.colors.error,
  },
  pendingBadge: {
    backgroundColor: theme.colors.warning,
  },
  badgeText: {
    color: "#fff",
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
  },
  infoSection: {
    gap: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.sm,
  },
  infoContent: {
    flex: 1,
    paddingTop: 2,
  },
  infoLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    fontWeight: "600",
  },
  appointmentDetails: {
    backgroundColor: "#dcfce7",
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.secondary,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  detailLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.secondary,
    fontWeight: "700",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  },
  acceptButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
    ...theme.shadow,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  buttonText: {
    color: "#fff",
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    gap: theme.spacing.xs,
  },
  rejectButtonText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.md,
    fontWeight: "600",
  },
  processedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  processedText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
  },
});
