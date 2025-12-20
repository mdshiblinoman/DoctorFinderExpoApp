import { db } from "@/firebaseConfig";
import { useLocalSearchParams } from "expo-router";
import { get, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DoctorDetails() {
  const { uid } = useLocalSearchParams(); // uid from navigation params
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
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Loading doctor details...</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFoundText}>Doctor not found</Text>
      </View>
    );
  }

  const infoFields = [
    { label: "Phone", value: doctor.phone, emoji: "📞" },
    { label: "Email", value: doctor.email, emoji: "📧" },
    { label: "Degree", value: doctor.degree, emoji: "🎓" },
    { label: "Department", value: doctor.department, emoji: "🏥" },
    { label: "Hospital", value: doctor.hospital, emoji: "🏩" },
    { label: "Chamber/Place", value: doctor.place, emoji: "📍" },
    { label: "Appointment Time", value: doctor.appointmentTime, emoji: "⏰" },
    { label: "Status", value: doctor.status, emoji: "👨‍⚕️" },
    { label: "Age", value: calculateAge(doctor.dob), emoji: "🎂" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* Doctor Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: doctor.photoURL || "https://cdn-icons-png.flaticon.com/512/1077/1077114.png" }}
          style={styles.avatar}
        />
        <Text style={styles.title}>{doctor.name}</Text>
        <Text style={styles.subtitle}>{doctor.degree} | {doctor.department}</Text>
        <Text style={styles.subtitle}>{doctor.hospital}</Text>
      </View>

      {/* Doctor Info */}
      <View style={styles.infoContainer}>
        {infoFields.map((field, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cardLabel}>{field.emoji} {field.label}</Text>
            <Text style={styles.cardValue}>{field.value}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#aafa",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8faff",
  },
  loadingText: {
    marginTop: 8,
    color: "#007bff",
    fontSize: 16,
  },
  notFoundText: {
    color: "#dc3545",
    fontSize: 16,
  },
  avatarContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#007bff10",
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#007bff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007bff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#495057",
    marginBottom: 2,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#f1e6efff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#f04806ff",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardLabel: {
    fontSize: 16,
    color: "#3fe60cff",
    marginBottom: 4,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "500",
    color: "#0a7ceeff",
  },
});
