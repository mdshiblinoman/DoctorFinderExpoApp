import { db } from "@/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { get, onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function AppointmentDetails() {
  const { doctorId, bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [doctorName, setDoctorName] = useState<string>("");
  const [appointmentTimeInput, setAppointmentTimeInput] = useState<string>("");

  useEffect(() => {
    if (!doctorId || !bookingId) return;

    // Fetch doctor info
    const doctorRef = ref(db, `doctors/${doctorId}`);
    onValue(doctorRef, (snapshot) => {
      if (snapshot.exists()) setDoctorName(snapshot.val().name);
    });

    // Fetch booking info
    const bookingRef = ref(db, `bookings/${doctorId}/${bookingId}`);
    const unsubscribe = onValue(bookingRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Generate serial number if not exists
        if (!data.serialNumber) {
          const today = new Date();
          const dateStr = today.toISOString().split("T")[0]; // YYYY-MM-DD

          const snapshotAll = await get(ref(db, `bookings/${doctorId}`));
          let count = 0;
          if (snapshotAll.exists()) {
            const bookingsObj = snapshotAll.val();
            Object.values(bookingsObj).forEach((b: any) => {
              const bDate = new Date(b.createdAt).toISOString().split("T")[0];
              if (bDate === dateStr) count++;
            });
          }
          const serialNumber = count + 1;

          await update(ref(db, `bookings/${doctorId}/${bookingId}`), {
            serialNumber,
            appointmentTime: data.appointmentTime || new Date().toLocaleString(),
          });
          data.serialNumber = serialNumber;
          data.appointmentTime = data.appointmentTime || new Date().toLocaleString();
        }

        setBooking(data);
        setAppointmentTimeInput(data.appointmentTime || "");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [doctorId, bookingId]);

  const handleSaveTime = async () => {
    if (!appointmentTimeInput) {
      Alert.alert("Error", "Please enter appointment time.");
      return;
    }
    await update(ref(db, `bookings/${doctorId}/${bookingId}`), {
      appointmentTime: appointmentTimeInput,
    });
    Alert.alert("Saved", "Appointment time updated.");
  };

  const handleSendSMS = () => {
    if (!booking) return;
    Alert.alert(
      "SMS Sent",
      `SMS sent to ${booking.phone}:\nDoctor: ${doctorName}\nSerial: ${booking.serialNumber}\nAppointment Time: ${appointmentTimeInput}`
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading appointment...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.center}>
        <Text>No appointment found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Appointment Confirmed ✅</Text>

      <Text style={styles.label}>Patient Name:</Text>
      <Text style={styles.value}>{booking.patientName}</Text>

      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{booking.phone}</Text>

      <Text style={styles.label}>Age:</Text>
      <Text style={styles.value}>{booking.age}</Text>

      <Text style={styles.label}>Reason:</Text>
      <Text style={styles.value}>{booking.reason}</Text>

      <Text style={styles.label}>Doctor:</Text>
      <Text style={styles.value}>Dr. {doctorName}</Text>

      <Text style={styles.label}>Serial Number:</Text>
      <Text style={styles.value}>{booking.serialNumber}</Text>

      <Text style={styles.label}>Appointment Time:</Text>
      <Text style={styles.value}>{booking.appointmentTime}</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter appointment time"
        value={appointmentTimeInput}
        onChangeText={setAppointmentTimeInput}
      />

      <TouchableOpacity style={styles.button} onPress={handleSaveTime}>
        <Text style={styles.btnText}>Save Time</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSendSMS}>
        <Text style={styles.btnText}>Send SMS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: "#9adbc2ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#1a237e",
  },
  label: { fontSize: 18, fontWeight: "700", marginTop: 10, color: "#555" },
  value: { fontSize: 20, color: "#ce1a29ff", marginTop: 2 },
  input: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 10,
    padding: 14,
    borderRadius: 8,
    backgroundColor: "#2aa043ff",
  },
  btnText: {
    color: "#0c0c0cff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
