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

export default function DepartmentScreen() {
  const [departments, setDepartments] = useState<string[]>([]);
  const [filteredDepartments, setFilteredDepartments] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const departmentSet = new Set<string>();
        Object.values<any>(data).forEach((doc) => {
          if (doc.department && doc.department.trim() !== "") {
            departmentSet.add(doc.department.trim());
          }
        });
        const deptArray = Array.from(departmentSet).sort();
        setDepartments(deptArray);
        setFilteredDepartments(deptArray);
      } else {
        setDepartments([]);
        setFilteredDepartments([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // filter departments based on search text
  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredDepartments(departments);
    } else {
      const filtered = departments.filter((dept) =>
        dept.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredDepartments(filtered);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading departments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Departments</Text>

      {/* --- Search Bar --- */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search department..."
        value={search}
        onChangeText={handleSearch}
      />

      {filteredDepartments.length === 0 ? (
        <Text style={styles.noData}>No departments found</Text>
      ) : (
        <FlatList
          data={filteredDepartments}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/Department/departmentDoctors",
                  params: { department: item },
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
  container: { flex: 1, backgroundColor: "#f0dedeff", padding: 16 },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  searchInput: {
    backgroundColor: "#95e09fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e6a7a7ff",
  },
  card: {
    backgroundColor: "#e0c5c5ff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: { fontSize: 18, fontWeight: "600", color: "#007bff" },
  noData: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#666",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
