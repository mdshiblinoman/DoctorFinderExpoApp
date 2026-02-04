import { theme } from "@/constants/theme";
import { db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
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

const departmentIcons: { [key: string]: string } = {
  cardiology: "heart",
  neurology: "brain",
  orthopedic: "body",
  pediatric: "happy",
  dermatology: "color-palette",
  gynecology: "female",
  ophthalmology: "eye",
  dentistry: "medical",
  psychiatry: "pulse",
  default: "medical",
};

const getDepartmentIcon = (dept: string) => {
  const key = dept.toLowerCase();
  for (const [k, v] of Object.entries(departmentIcons)) {
    if (key.includes(k)) return v;
  }
  return departmentIcons.default;
};

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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading departments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton title="Departments" />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search departments..."
            placeholderTextColor={theme.colors.textLight}
            value={search}
            onChangeText={handleSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredDepartments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="medical-outline" size={64} color={theme.colors.muted} />
          <Text style={styles.emptyTitle}>No departments found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDepartments}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/Department/departmentDoctors",
                  params: { department: item },
                })
              }
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getDepartmentIcon(item) as any}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.departmentName}>{item}</Text>
                <Text style={styles.viewText}>View doctors →</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={theme.colors.muted} />
            </TouchableOpacity>
          )}
        />
      )}

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
  searchContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
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
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 100,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.sm,
    ...theme.shadow,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  departmentName: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
  },
  viewText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});
