import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

export default function HomeScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const { width } = useWindowDimensions();
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";

  // Number of columns based on screen width
  let numColumns = 1;
  if (width >= 1200) numColumns = 4; // Desktop
  else if (width >= 768) numColumns = 3; // Tablet
  else numColumns = 1; // Mobile

  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const doctorList = Object.values(data);
        setDoctors(doctorList);
        setFilteredDoctors(doctorList);
      } else {
        setDoctors([]);
        setFilteredDoctors([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (search.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const q = search.toLowerCase();
      const result = doctors.filter((item: any) =>
        item.name?.toLowerCase().includes(q)
      );
      setFilteredDoctors(result);
    }
  }, [search, doctors]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Loading doctors...</Text>
      </View>
    );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerSection}>
        <Text style={styles.headerText}>Available Doctors</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by name"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={theme.colors.muted}
        />
      </View>

      {/* Doctor List */}
      {filteredDoctors.length === 0 ? (
        <Text style={styles.noData}>No doctors found</Text>
      ) : (
        <FlatList
          data={filteredDoctors}
          numColumns={numColumns}
          key={numColumns} // re-render on column change
          keyExtractor={(item: any, index) => item.uid || index.toString()}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={
            numColumns > 1 ? { justifyContent: "space-between" } : undefined
          }
          renderItem={({ item }) => (
            <View style={[styles.card, { width: `${100 / numColumns - 2}%` }]}>
              <Image
                source={{ uri: item.photoURL || defaultLogo }}
                style={styles.logo}
              />
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.text}>🎓 {item.degree}</Text>
                <Text style={styles.text}>🏥 {item.department}</Text>
                <Text style={styles.text}>🏩 {item.hospital}</Text>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: "#007bff" }]}
                  onPress={() =>
                    router.push({
                      pathname: "/Home/(tabs)/doctorDetails",
                      params: { uid: item.uid },
                    })
                  }
                >
                  <Text style={styles.btnText}>More</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, { backgroundColor: theme.colors.secondary }]}
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

      {/* Floating AI Chat Button - Enhanced */}
      <TouchableOpacity
        style={styles.aiChatButton}
        onPress={() => router.push("/Home/(tabs)/aiChat")}
        activeOpacity={0.8}
      >
        <View style={styles.aiChatIconContainer}>
          <Ionicons name="chatbubbles" size={26} color="#fff" />
          <View style={styles.aiChatBadge}>
            <Ionicons name="sparkles" size={10} color="#FFD700" />
          </View>
        </View>
        <Text style={styles.aiChatLabel}>AI Help</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingBottom: 70 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerSection: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.lg,
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    alignItems: "center",
    ...theme.shadow,
  },
  headerText: { fontSize: 22, fontWeight: "700", color: theme.colors.surface },
  searchContainer: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: theme.spacing.sm },
  searchBar: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    fontSize: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContainer: { paddingHorizontal: theme.spacing.lg, paddingBottom: theme.spacing.lg },
  card: {
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.md,
    alignItems: "center",
    ...theme.shadow,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logo: { width: 80, height: 80, borderRadius: 40, marginBottom: theme.spacing.sm },
  info: { alignItems: "center" },
  name: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: theme.colors.text },
  text: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: 2 },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  btn: { flex: 1, paddingVertical: 8, borderRadius: theme.radius.sm, alignItems: "center" },
  btnText: { color: theme.colors.surface, fontWeight: "700", fontSize: 14 },
  noData: { textAlign: "center", marginTop: 40, fontSize: 16, color: theme.colors.muted },

  // Enhanced AI Chat Button Styles
  aiChatButton: {
    position: "absolute",
    right: 20,
    bottom: 90,
    backgroundColor: "#007AFF",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  aiChatIconContainer: {
    position: "relative",
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  aiChatBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  aiChatLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
