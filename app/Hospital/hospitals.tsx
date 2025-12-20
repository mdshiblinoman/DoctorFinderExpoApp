// app/hospital.tsx
import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../ButtonNav/components";

export default function HospitalScreen() {
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const hospitalSet = new Set<string>();

        Object.values<any>(data).forEach((doc) => {
          if (doc.hospital && doc.hospital.trim() !== "") {
            hospitalSet.add(doc.hospital.trim());
          }
        });

        const hospitalList = Array.from(hospitalSet).sort();
        setHospitals(hospitalList);
        setFilteredHospitals(hospitalList);
      } else {
        setHospitals([]);
        setFilteredHospitals([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredHospitals(hospitals);
    } else {
      const filtered = hospitals.filter((item) =>
        item.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredHospitals(filtered);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading hospitals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <Text style={styles.header}>Hospitals</Text>

      {/* --- Search Bar under heading --- */}
      <TextInput
        style={styles.searchBar}
        placeholder="Search hospitals..."
        value={search}
        onChangeText={handleSearch}
      />

      {filteredHospitals.length === 0 ? (
        <Text style={styles.noData}>No hospitals found</Text>
      ) : (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/Hospital/hospitalDoctors",
                  params: { hospital: item },
                })
              }
            >
              <Text style={styles.name}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* --- Bottom Navigation --- */}
      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 16, paddingBottom: 70 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12, textAlign: "center", color: "#333" },
  searchBar: {
    backgroundColor: "#dae4e6ff",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e9c5c5ff",
  },
  card: {
    backgroundColor: "#a2acaaff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "600", color: "#e70e85ff" },
  noData: { textAlign: "center", marginTop: 40, fontSize: 16, color: "#ec7373ff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
