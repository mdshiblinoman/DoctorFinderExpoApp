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
      const formattedTime = `${hours > 12 ? hours - 12 : hours}:${minutes
        .toString()
        .padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;

      const today = new Date();
      const formattedDate = today.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
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
              console.log("Email notification sent successfully");
            } else {
              console.log("Email notification failed:", result.error);
            }
          })
          .catch((error: unknown) => {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.log("Email error:", errorMessage);
          });
      }

      Alert.alert(
        "Success",
        `Booking accepted!\n\nSerial: ${serialNumber}\nTime: ${formattedTime}\nDuration: 20 minutes${
          item.email ? "\n\nEmail confirmation sent to patient" : ""
        }`
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

    Alert.alert("Reject Booking", "Are you sure you want to reject this booking?", [
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
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-base text-slate-500">Loading bookings...</Text>
      </View>
    );
  }

  const pendingCount = bookings.filter((b) => !b.status || b.status === "pending").length;
  const acceptedCount = bookings.filter((b) => b.status === "accepted").length;

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={theme.colors.gradientPrimary}
        className="rounded-b-3xl px-4 pb-6"
        style={{ paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 0) + 16 : 60 }}
      >
        <View className="mb-4 flex-row items-center justify-between">
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-white/20" onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-2xl font-bold text-white">Appointment Requests</Text>
          <View className="w-10" />
        </View>

        <View className="mt-2 flex-row items-center justify-around rounded-2xl bg-white/15 py-4">
          <View className="flex-1 items-center">
            <Text className="text-3xl font-bold text-white">{pendingCount}</Text>
            <Text className="mt-0.5 text-xs text-white/80">Pending</Text>
          </View>
          <View className="h-8 w-px bg-white/30" />
          <View className="flex-1 items-center">
            <Text className="text-3xl font-bold text-white">{acceptedCount}</Text>
            <Text className="mt-0.5 text-xs text-white/80">Accepted</Text>
          </View>
          <View className="h-8 w-px bg-white/30" />
          <View className="flex-1 items-center">
            <Text className="text-3xl font-bold text-white">{bookings.length}</Text>
            <Text className="mt-0.5 text-xs text-white/80">Total</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerClassName="p-4 pb-16" showsVerticalScrollIndicator={false}>
        {bookings.length === 0 ? (
          <View className="items-center py-16">
            <View className="mb-6 h-24 w-24 items-center justify-center rounded-full bg-white shadow">
              <Ionicons name="calendar-outline" size={56} color={theme.colors.textLight} />
            </View>
            <Text className="mb-1 text-2xl font-bold text-slate-800">No Booking Requests</Text>
            <Text className="px-10 text-center text-base text-slate-500">
              You don't have any pending appointment requests at the moment.
            </Text>
          </View>
        ) : (
          bookings.map((item: any) => {
            const badgeBg = item.status === "accepted" ? "bg-emerald-500" : item.status === "rejected" ? "bg-rose-500" : "bg-amber-500";
            const isProcessed = item.status === "accepted" || item.status === "rejected";

            return (
              <View key={item.id} className="mb-4 rounded-2xl bg-white p-5 shadow">
                <View className={`mb-4 self-start rounded-full px-3 py-1.5 ${badgeBg} flex-row items-center gap-1`}>
                  <Ionicons
                    name={
                      item.status === "accepted"
                        ? "checkmark-circle"
                        : item.status === "rejected"
                          ? "close-circle"
                          : "time-outline"
                    }
                    size={14}
                    color="#fff"
                  />
                  <Text className="text-xs font-semibold text-white">
                    {item.status === "accepted" ? "Accepted" : item.status === "rejected" ? "Rejected" : "Pending"}
                  </Text>
                </View>

                <View className="gap-3">
                  <View className="flex-row items-start">
                    <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                      <Ionicons name="person" size={18} color={theme.colors.primary} />
                    </View>
                    <View className="flex-1 pt-0.5">
                      <Text className="text-xs text-slate-500">Patient Name</Text>
                      <Text className="text-base font-semibold text-slate-800">{item.patientName || "N/A"}</Text>
                    </View>
                  </View>

                  <View className="flex-row items-start">
                    <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                      <Ionicons name="call" size={18} color={theme.colors.primary} />
                    </View>
                    <View className="flex-1 pt-0.5">
                      <Text className="text-xs text-slate-500">Phone Number</Text>
                      <Text className="text-base font-semibold text-slate-800">{item.phone || "N/A"}</Text>
                    </View>
                  </View>

                  {item.email && (
                    <View className="flex-row items-start">
                      <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                        <Ionicons name="mail" size={18} color={theme.colors.primary} />
                      </View>
                      <View className="flex-1 pt-0.5">
                        <Text className="text-xs text-slate-500">Email Address</Text>
                        <Text className="text-base font-semibold text-slate-800">{item.email}</Text>
                      </View>
                    </View>
                  )}

                  {item.reason && (
                    <View className="flex-row items-start">
                      <View className="mr-2 h-9 w-9 items-center justify-center rounded-full bg-slate-50">
                        <Ionicons name="document-text" size={18} color={theme.colors.primary} />
                      </View>
                      <View className="flex-1 pt-0.5">
                        <Text className="text-xs text-slate-500">Reason for Visit</Text>
                        <Text className="text-base font-semibold text-slate-800">{item.reason}</Text>
                      </View>
                    </View>
                  )}
                </View>

                {item.status === "accepted" && (
                  <View className="mt-4 rounded-xl border-l-4 border-emerald-500 bg-emerald-100 p-3">
                    <View className="mb-1 flex-row items-center gap-1">
                      <Ionicons name="newspaper" size={16} color={theme.colors.secondary} />
                      <Text className="text-sm text-slate-500">Serial No:</Text>
                      <Text className="flex-1 text-sm font-bold text-emerald-600">#{item.serialNumber}</Text>
                    </View>
                    <View className="mb-1 flex-row items-center gap-1">
                      <Ionicons name="time" size={16} color={theme.colors.secondary} />
                      <Text className="text-sm text-slate-500">Time:</Text>
                      <Text className="flex-1 text-sm font-bold text-emerald-600">{item.appointmentTime}</Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="hourglass" size={16} color={theme.colors.secondary} />
                      <Text className="text-sm text-slate-500">Duration:</Text>
                      <Text className="flex-1 text-sm font-bold text-emerald-600">{item.appointmentDuration}</Text>
                    </View>
                  </View>
                )}

                {!isProcessed ? (
                  <View className="mt-5 flex-row gap-2">
                    <TouchableOpacity className="flex-1 overflow-hidden rounded-xl shadow" onPress={() => handleAccept(item)} activeOpacity={0.8}>
                      <LinearGradient colors={theme.colors.gradientSecondary} className="flex-row items-center justify-center gap-1 py-3.5">
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text className="text-base font-semibold text-white">Accept</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity
                      className="flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-rose-500 py-3.5"
                      onPress={() => handleReject(item)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle-outline" size={18} color={theme.colors.error} />
                      <Text className="text-base font-semibold text-rose-500">Reject</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View className="mt-4 flex-row items-center justify-center gap-1">
                    <Ionicons
                      name={item.status === "accepted" ? "checkmark-done-circle" : "close-circle"}
                      size={20}
                      color={item.status === "accepted" ? theme.colors.secondary : theme.colors.error}
                    />
                    <Text style={{ color: item.status === "accepted" ? theme.colors.secondary : theme.colors.error }} className="text-sm font-semibold">
                      This booking has been {item.status}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
