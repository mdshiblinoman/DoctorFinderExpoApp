import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { useLocalSearchParams } from "expo-router";
import { get, onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#007bff" />
        <Text className="mt-2 text-base text-gray-700">Loading appointment...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-base text-gray-700">No appointment found.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#9adbc2] p-5">
      <BackButton title="Appointment Details" />

      <Text className="mt-3 text-lg font-bold text-gray-600">Patient Name:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">{booking.patientName}</Text>

      <Text className="mt-3 text-lg font-bold text-gray-600">Phone:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">{booking.phone}</Text>

      <Text className="mt-3 text-lg font-bold text-gray-600">Age:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">{booking.age}</Text>

      <Text className="mt-3 text-lg font-bold text-gray-600">Reason:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">{booking.reason}</Text>

      <Text className="mt-3 text-lg font-bold text-gray-600">Doctor:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">Dr. {doctorName}</Text>

      <Text className="mt-3 text-lg font-bold text-gray-600">Serial Number:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">{booking.serialNumber}</Text>

      <Text className="mt-3 text-lg font-bold text-gray-600">Appointment Time:</Text>
      <Text className="mt-1 text-xl text-[#ce1a29]">{booking.appointmentTime}</Text>

      <TextInput
        className="mt-3 rounded-lg border border-gray-300 bg-white px-3 py-3 text-base text-gray-800"
        placeholder="Enter appointment time"
        value={appointmentTimeInput}
        onChangeText={setAppointmentTimeInput}
      />

      <TouchableOpacity className="mt-3 rounded-lg bg-[#2aa043] px-3 py-3.5" onPress={handleSaveTime}>
        <Text className="text-center text-base font-bold text-black">Save Time</Text>
      </TouchableOpacity>

      <TouchableOpacity className="mt-3 rounded-lg bg-[#2aa043] px-3 py-3.5" onPress={handleSendSMS}>
        <Text className="text-center text-base font-bold text-black">Send SMS</Text>
      </TouchableOpacity>
    </View>
  );
}
