import { auth, db } from "@/firebaseConfig";
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
      "Confirm Delete",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await remove(ref(db, `doctors/${uid}`));
              Alert.alert("Deleted", "Your account has been deleted.");
              router.replace("/screen/login");
            } catch (error: any) {
              Alert.alert("Error", error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.header}>My Profile</Text>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#007bff" />
            <Text>Loading your profile...</Text>
          </View>
        ) : doctor ? (
          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{doctor.name}</Text>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{doctor.email}</Text>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{doctor.phone}</Text>
            <Text style={styles.label}>Department</Text>
            <Text style={styles.value}>{doctor.department}</Text>
            <Text style={styles.label}>Hospital</Text>
            <Text style={styles.value}>{doctor.hospital}</Text>
            <Text style={styles.label}>Degree</Text>
            <Text style={styles.value}>{doctor.degree}</Text>
            <Text style={styles.label}>Appointment Time</Text>
            <Text style={styles.value}>{doctor.appointmentTime}</Text>
            <Text style={styles.label}>Place</Text>
            <Text style={styles.value}>{doctor.place}</Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#5e66d1ff" }]}
                onPress={() =>
                  router.push({
                    pathname: "/Doctor/editDoctor",
                    params: { uid },
                  })
                }
              >
                <Text style={styles.btnText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#df4f51ff" }]}
                onPress={handleDelete}
              >
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>

            {/* ✅ New Booking Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#28a745", marginTop: 12 }]}
              onPress={() =>
                router.push({
                  pathname: "/Doctor/booking",
                  params: { doctorId: uid },
                })
              }
            >
              <Text style={styles.btnText}>Booking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.center}>
            <Text>No doctor information found.</Text>
          </View>
        )}
      </ScrollView>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e0b9b9ff" },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#332828ff",
  },
  card: {
    backgroundColor: "#c2e2ebff",
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    marginBottom: 16,
  },
  label: { fontSize: 16, fontWeight: "700", color: "#555", marginTop: 8 },
  value: {
    fontSize: 16,
    color: "#a72f71ff",
    marginBottom: 4,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  btnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
});
