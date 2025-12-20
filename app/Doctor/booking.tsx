import { db } from "@/firebaseConfig";
import { sendAcceptanceEmail } from "@/services/emailService";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingList() {
  const { doctorId } = useLocalSearchParams(); // doctorId must come from navigation
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
            // Prefer createdAt when present, otherwise fallback to key order
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            if (aTime !== 0 || bTime !== 0) return bTime - aTime;
            return b.id.localeCompare(a.id); // push keys are time-ordered
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

    // Check if already accepted or rejected
    if (item.status === "accepted" || item.status === "rejected") {
      Alert.alert("Notice", "This booking has already been processed.");
      return;
    }

    try {
      // Count existing accepted bookings to determine serial number
      const acceptedBookings = bookings.filter((b: any) => b.status === "accepted").length;
      const serialNumber = acceptedBookings + 1;

      // Calculate appointment time based on serial number (20 minutes apart)
      const baseTime = new Date();
      baseTime.setHours(9, 0, 0, 0); // Start at 9:00 AM
      const appointmentTime = new Date(baseTime.getTime() + (serialNumber - 1) * 20 * 60000);

      const hours = appointmentTime.getHours();
      const minutes = appointmentTime.getMinutes();
      const formattedTime = `${hours > 12 ? hours - 12 : hours}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;

      // Format date
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

      // Send acceptance email to patient
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

        // Send email asynchronously (don't block UI)
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

    // Check if already accepted or rejected
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
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 16, color: "#666" }}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>Appointment Requests</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No Booking Requests</Text>
            <Text style={styles.emptyText}>
              You don't have any pending appointment requests at the moment.
            </Text>
          </View>
        ) : (
          bookings.map((item: any) => (
            <View key={item.id} style={styles.card}>
              {/* Status Badge */}
              {item.status === "accepted" && (
                <View style={[styles.statusBadge, styles.acceptedBadge]}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.badgeText}>Accepted</Text>
                </View>
              )}
              {item.status === "rejected" && (
                <View style={[styles.statusBadge, styles.rejectedBadge]}>
                  <Ionicons name="close-circle" size={16} color="#fff" />
                  <Text style={styles.badgeText}>Rejected</Text>
                </View>
              )}
              {!item.status && (
                <View style={[styles.statusBadge, styles.pendingBadge]}>
                  <Ionicons name="time-outline" size={16} color="#fff" />
                  <Text style={styles.badgeText}>Pending</Text>
                </View>
              )}

              {/* Patient Info */}
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Patient Name</Text>
                  <Text style={styles.value}>{item.patientName || "N/A"}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="call" size={20} color="#007AFF" />
                <View style={styles.infoContent}>
                  <Text style={styles.label}>Phone Number</Text>
                  <Text style={styles.value}>{item.phone || "N/A"}</Text>
                </View>
              </View>

              {item.email && (
                <View style={styles.infoRow}>
                  <Ionicons name="mail" size={20} color="#007AFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.label}>Email Address</Text>
                    <Text style={styles.value}>{item.email}</Text>
                  </View>
                </View>
              )}

              {item.reason && (
                <View style={styles.infoRow}>
                  <Ionicons name="document-text" size={20} color="#007AFF" />
                  <View style={styles.infoContent}>
                    <Text style={styles.label}>Reason for Visit</Text>
                    <Text style={styles.value}>{item.reason}</Text>
                  </View>
                </View>
              )}

              {/* Appointment Details (if accepted) */}
              {item.status === "accepted" && (
                <View style={styles.appointmentDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="newspaper" size={18} color="#28a745" />
                    <Text style={styles.detailLabel}>Serial No:</Text>
                    <Text style={styles.detailValue}>#{item.serialNumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="time" size={18} color="#28a745" />
                    <Text style={styles.detailLabel}>Time:</Text>
                    <Text style={styles.detailValue}>{item.appointmentTime}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="hourglass" size={18} color="#28a745" />
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>{item.appointmentDuration}</Text>
                  </View>
                </View>
              )}

              {/* Action Buttons */}
              {!item.status || (item.status !== "accepted" && item.status !== "rejected") ? (
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.acceptButton]}
                    onPress={() => handleAccept(item)}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <Text style={styles.btnText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item)}
                  >
                    <Ionicons name="close-circle-outline" size={20} color="#fff" />
                    <Text style={styles.btnText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.processedContainer}>
                  <Ionicons
                    name={item.status === "accepted" ? "checkmark-done-circle" : "close-circle"}
                    size={24}
                    color={item.status === "accepted" ? "#28a745" : "#dc3545"}
                  />
                  <Text style={[
                    styles.processedText,
                    { color: item.status === "accepted" ? "#28a745" : "#dc3545" }
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
  wrapper: {
    flex: 1,
    backgroundColor: "#f5f7fa",
  },
  headerContainer: {
    backgroundColor: "#007AFF",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholder: {
    width: 40,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    gap: 4,
  },
  acceptedBadge: {
    backgroundColor: "#28a745",
  },
  rejectedBadge: {
    backgroundColor: "#dc3545",
  },
  pendingBadge: {
    backgroundColor: "#ffc107",
  },
  badgeText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  value: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  appointmentDetails: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#28a745",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#555",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#28a745",
    fontWeight: "700",
    flex: 1,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  acceptButton: {
    backgroundColor: "#28a745",
  },
  rejectButton: {
    backgroundColor: "#dc3545",
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  processedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    marginTop: 12,
  },
  processedText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
