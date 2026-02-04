// app/hospitalDoctors.tsx
import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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

export default function HospitalDoctors() {
  const { hospital } = useLocalSearchParams();
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
        const filtered = Object.values<any>(data).filter(
          (doc) =>
            String(doc.hospital ?? "")
              .trim()
              .toLowerCase() ===
            String(hospital ?? "")
              .trim()
              .toLowerCase()
        );
        setDoctors(filtered);
      } else setDoctors([]);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hospital]);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );

  const renderDoctorCard = ({ item }: { item: any }) => (
    <View style={[styles.card, numColumns > 1 && { width: `${100 / numColumns - 2}%` }]}>
      <View style={styles.cardHeader}>
        {item.photoUrl ? (
          <Image source={{ uri: item.photoUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient
            colors={theme.colors.gradientPrimary}
            style={styles.avatarPlaceholder}
          >
            <Text style={styles.avatarText}>
              {item.name?.charAt(0)?.toUpperCase() || "D"}
            </Text>
          </LinearGradient>
        )}
        <View style={styles.statusIndicator} />
      </View>

      <Text style={styles.doctorName}>Dr. {item.name}</Text>

      <View style={styles.infoRow}>
        <Ionicons name="school-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.infoText} numberOfLines={1}>{item.degree}</Text>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="medical-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.infoText} numberOfLines={1}>{item.department}</Text>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={() =>
            router.push({
              pathname: "/Home/doctorDetails",
              params: { uid: item.uid },
            })
          }
          activeOpacity={0.7}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bookButton}
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
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={theme.colors.gradientSecondary}
            style={styles.bookButtonGradient}
          >
            <Text style={styles.bookButtonText}>Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <BackButton title={`Doctors at ${hospital}`} />

      {doctors.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={60} color={theme.colors.textLight} />
          <Text style={styles.emptyTitle}>No Doctors Found</Text>
          <Text style={styles.emptyText}>No doctors are currently available in this hospital</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={
            numColumns > 1 ? styles.columnWrapper : undefined
          }
          contentContainerStyle={styles.listContent}
          keyExtractor={(item: any, index) => item.uid || index.toString()}
          renderItem={renderDoctorCard}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  center: {
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
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.md,
    alignItems: "center",
    ...theme.shadow,
  },
  cardHeader: {
    position: "relative",
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  avatarPlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: theme.fontSize.xxl,
    fontWeight: "700",
    color: "#fff",
  },
  statusIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.secondary,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  doctorName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    textAlign: "center",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.xs,
    marginTop: 2,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    marginTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  detailsButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  detailsButtonText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: theme.fontSize.sm,
  },
  bookButton: {
    flex: 1,
    borderRadius: theme.radius.md,
    overflow: "hidden",
  },
  bookButtonGradient: {
    paddingVertical: theme.spacing.sm,
    alignItems: "center",
  },
  bookButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: theme.fontSize.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: "700",
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    textAlign: "center",
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
