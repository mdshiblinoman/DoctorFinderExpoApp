import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";
import BottomNav from "../../ButtonNav/components";

export default function HomeScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const { width } = useWindowDimensions();
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";

  let numColumns = 1;
  if (width >= 1200) numColumns = 4;
  else if (width >= 768) numColumns = 3;
  else numColumns = 1;

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
        item.name?.toLowerCase().includes(q) ||
        item.department?.toLowerCase().includes(q) ||
        item.hospital?.toLowerCase().includes(q)
      );
      setFilteredDoctors(result);
    }
  }, [search, doctors]);

  const renderDoctorCard = ({ item }: { item: any }) => (
    <View style={[styles.card, numColumns > 1 && { width: `${100 / numColumns - 2}%` }]}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: item.photoURL || defaultLogo }}
          style={styles.avatar}
        />
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'active' ? theme.colors.success : theme.colors.warning }]} />
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.doctorName} numberOfLines={1}>{item.name}</Text>

        <View style={styles.infoRow}>
          <Ionicons name="school-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{item.degree}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="medical-outline" size={14} color={theme.colors.primary} />
          <Text style={styles.departmentText} numberOfLines={1}>{item.department}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
          <Text style={styles.infoText} numberOfLines={1}>{item.hospital}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            router.push({
              pathname: "/Home/(tabs)/doctorDetails",
              params: { uid: item.uid },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookingButton}
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
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={theme.colors.gradientSecondary}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.bookingButtonGradient}
          >
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text style={styles.bookingButtonText}>Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Find Your Doctor</Text>
          <Text style={styles.headerSubtitle}>{doctors.length} doctors available</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search doctors, departments..."
              placeholderTextColor={theme.colors.textLight}
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Doctor List */}
      {filteredDoctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color={theme.colors.muted} />
          <Text style={styles.emptyTitle}>No doctors found</Text>
          <Text style={styles.emptyText}>Try searching with different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item: any, index) => item.uid || index.toString()}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : undefined}
          renderItem={renderDoctorCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating AI Chat Button */}
      <TouchableOpacity
        style={styles.aiChatButton}
        onPress={() => router.push("/Home/(tabs)/aiChat")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={theme.colors.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.aiChatGradient}
        >
          <MaterialCommunityIcons name="robot-happy-outline" size={26} color="#fff" />
        </LinearGradient>
        <View style={styles.aiChatBadge}>
          <Ionicons name="sparkles" size={10} color="#fff" />
        </View>
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  headerContent: {
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: "#fff",
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: "rgba(255,255,255,0.8)",
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    marginTop: theme.spacing.sm,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadow,
  },
  searchInput: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    paddingVertical: theme.spacing.xs,
  },
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 120,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    overflow: "hidden",
    ...theme.shadow,
  },
  cardHeader: {
    alignItems: "center",
    paddingTop: theme.spacing.lg,
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.primaryLight,
  },
  statusBadge: {
    position: "absolute",
    bottom: 0,
    right: "35%",
    backgroundColor: theme.colors.surface,
    borderRadius: 10,
    padding: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  cardContent: {
    padding: theme.spacing.md,
    alignItems: "center",
  },
  doctorName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  departmentText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  detailsButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  detailsButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.primary,
  },
  bookingButton: {
    flex: 1,
  },
  bookingButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  bookingButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: "#fff",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
    textAlign: "center",
  },
  aiChatButton: {
    position: "absolute",
    right: theme.spacing.lg,
    bottom: 100,
    zIndex: 100,
  },
  aiChatGradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadowLarge,
  },
  aiChatBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.warning,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
});
