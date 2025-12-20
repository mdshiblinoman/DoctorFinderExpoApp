// app/Department/departmentDoctors.tsx
import { db } from "@/firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export default function DepartmentDoctors() {
  const { department } = useLocalSearchParams(); 
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { width } = useWindowDimensions();

  let numColumns = 1;
  if (width >= 1200) numColumns = 4;
  else if (width >= 768) numColumns = 3;
  else numColumns = 1;

  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const filteredDoctors = Object.values<any>(data).filter(
          (doc) =>
            String(doc.department ?? "").trim().toLowerCase() ===
            String(department ?? "").trim().toLowerCase()
        );
        setDoctors(filteredDoctors);
      } else {
        setDoctors([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [department]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Doctors in {department}</Text>

      {doctors.length === 0 ? (
        <Text style={styles.noData}>No doctors found in this department</Text>
      ) : (
        <FlatList
          data={doctors}
          numColumns={numColumns}
          key={numColumns} 
          columnWrapperStyle={
            numColumns > 1 ? { justifyContent: "space-between" } : undefined
          }
          keyExtractor={(item: any, index) => item.uid || index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.card, { width: `${100 / numColumns - 2}%` }]}>
              {item.photoUrl ? (
                <Image source={{ uri: item.photoUrl }} style={styles.image} />
              ) : (
                <View style={styles.iconWrapper}>
                  <Icon name="person-circle-outline" size={70} color="#007bff" />
                </View>
              )}
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.text}>{item.degree}</Text>
              <Text style={styles.text}>{item.hospital}</Text>

              {/* Buttons Row */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#007bff" }]}
                  onPress={() =>
                    router.push({
                      pathname: "/Home/doctorDetails",
                      params: { uid: item.uid },
                    })
                  }
                >
                  <Text style={styles.btnText}>More</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#28a745" }]}
                  onPress={() =>
                    router.push({
                      pathname: "/Booking/booking",
                      params: {
                        uid: item.uid,
                        name: item.name,
                        hospital: item.hospital,
                        department: item.department,
                      },
                    })
                  }
                >
                  <Text style={styles.btnText}>Booking</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#e7d8d8ff", padding: 16 },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  card: {
    backgroundColor: "#b0c3c4ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    elevation: 3,
  },
  image: { width: 70, height: 70, borderRadius: 35, marginBottom: 8 },
  iconWrapper: { marginBottom: 8 },
  name: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  text: { fontSize: 16, color: "#614b4bff", textAlign: "center" },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 8,
    gap: 8,
  },
  btn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  noData: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#666" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
