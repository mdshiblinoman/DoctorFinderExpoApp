import { auth, db } from "@/firebaseConfig";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { onValue, push, ref, set } from "firebase/database";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function BookingScreen() {
  const { uid } = useLocalSearchParams(); // doctorId
  const [doctor, setDoctor] = useState<any>(null);

  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");

  // Fetch doctor info
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
      Alert.alert("Error", "Please fill all fields before submitting.");
      return;
    }
    try {
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
      });
      Alert.alert("Success", "Booking sent to doctor!");
      setPatientName("");
      setPhone("");
      setAge("");
      setEmail("");
      setReason("");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  const handleNumericInput = (value: string, setter: (val: string) => void) => {
    setter(value.replace(/[^0-9]/g, ""));
  };

  const allFilled = patientName && phone && age && reason && (email.trim() || auth.currentUser?.email);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Doctor Card */}
      {doctor && (
        <View style={styles.doctorCard}>
          <View style={styles.docHeader}>
            <MaterialIcons name="medical-services" size={28} color="#1a237e" />
            <Text style={styles.docName}>Dr. {doctor.name}</Text>
          </View>
          <Text style={styles.docInfo}>🏥 {doctor.hospital}</Text>
          <Text style={styles.docInfo}>🩺 {doctor.department}</Text>
        </View>
      )}

      {/* Input Fields */}
      <TextInput
        placeholder="Patient Name"
        style={styles.input}
        value={patientName}
        onChangeText={setPatientName}
      />
      <TextInput
        placeholder="Patient Email"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        placeholder="Phone Number"
        style={styles.input}
        keyboardType="numeric"
        value={phone}
        onChangeText={(val) => handleNumericInput(val, setPhone)}
      />
      <TextInput
        placeholder="Age"
        style={styles.input}
        keyboardType="numeric"
        value={age}
        onChangeText={(val) => handleNumericInput(val, setAge)}
      />
      <TextInput
        placeholder="Reason / Illness"
        style={[styles.input, { height: 100 }]}
        multiline
        value={reason}
        onChangeText={setReason}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: allFilled ? "#1e88e5" : "#aaa" },
        ]}
        disabled={!allFilled}
        onPress={handleSubmit}
      >
        <Text style={styles.btnText}>Submit Booking</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, backgroundColor: "#77abd6ff" },
  doctorCard: {
    backgroundColor: "#e6dbdbff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f8acacff",
    elevation: 3,
  },
  docHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  docName: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#1a237e",
  },
  docInfo: { fontSize: 16, color: "#555", marginBottom: 4 },
  input: {
    backgroundColor: "#b8d4e0ff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#6fc1c4ff",
  },
  button: { padding: 14, borderRadius: 8, marginTop: 10 },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});
