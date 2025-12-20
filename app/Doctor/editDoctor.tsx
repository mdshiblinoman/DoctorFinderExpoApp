// app/doctorEdit.tsx
import { db } from "@/firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref, update } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function DoctorEdit() {
  const { uid } = useLocalSearchParams();
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
      Alert.alert("Success", "Doctor profile updated successfully!");
      router.back();
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text>No doctor found</Text>
      </View>
    );
  }

  const fieldLabels: any = {
    name: "Name",
    phone: "Phone",
    email: "Email",
    department: "Department",
    hospital: "Hospital",
    degree: "Degree",
    appointmentTime: "Appointment Time",
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
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 140 }}>
      <Text style={styles.header}>Edit Doctor Profile</Text>

      {Object.keys(form).map((key) => (
        <View key={key} style={styles.inputGroup}>
          <Text style={styles.label}>{fieldLabels[key]}</Text>
          <TextInput
            style={[
              styles.input,
              readOnlyFields.includes(key) && styles.readOnly,
            ]}
            value={form[key]}
            onChangeText={(val) => handleChange(key, val)}
            placeholder={`Enter ${fieldLabels[key]}`}
            editable={!readOnlyFields.includes(key)}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.updateBtn} onPress={handleUpdate}>
        <Text style={styles.updateText}>Update</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#d3a8a8ff", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 16, fontWeight: "600", color: "#555", marginBottom: 6 },
  input: {
    backgroundColor: "#dae2d6ff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  readOnly: { backgroundColor: "#ca628aff" },
  updateBtn: {
    marginTop: 20,
    backgroundColor: "#007bff",
    paddingVertical: 14,
    borderRadius: 10,
  },
  updateText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
