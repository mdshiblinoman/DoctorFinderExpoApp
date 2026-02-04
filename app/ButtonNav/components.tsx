// components/BottomNav.tsx
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const navItems = [
  { label: "Home", icon: "home", route: "/Home/(tabs)/home" },
  { label: "Department", icon: "medical", route: "/Department/department" },
  { label: "Hospital", icon: "business", route: "/Hospital/hospitals" },
];

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (route: string) => {
    return pathname.includes(route.split("/")[1]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {navItems.map((item, index) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={index}
              style={styles.navBtn}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              {active ? (
                <LinearGradient
                  colors={theme.colors.gradientPrimary}
                  style={styles.activeIconContainer}
                >
                  <Ionicons name={item.icon as any} size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View style={styles.iconContainer}>
                  <Ionicons name={`${item.icon}-outline` as any} size={22} color={theme.colors.textSecondary} />
                </View>
              )}
              <Text style={[styles.navText, active && styles.navTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "transparent",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.xl,
    ...theme.shadowLarge,
  },
  navBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: theme.spacing.xs,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  activeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  navText: {
    fontSize: theme.fontSize.xs,
    fontWeight: "600",
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  navTextActive: {
    color: theme.colors.primary,
  },
});
