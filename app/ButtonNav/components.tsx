// components/BottomNav.tsx
import { theme } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, usePathname } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

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
    <View className="absolute bottom-0 left-0 right-0 bg-transparent px-4 pb-4">
      <View
        className="flex-row justify-around items-center bg-white py-2 px-4 rounded-3xl"
        style={theme.shadowLarge}
      >
        {navItems.map((item, index) => {
          const active = isActive(item.route);
          return (
            <TouchableOpacity
              key={index}
              className="flex-1 items-center py-1"
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              {active ? (
                <LinearGradient
                  colors={theme.colors.gradientPrimary}
                  className="w-11 h-11 rounded-full justify-center items-center"
                >
                  <Ionicons name={item.icon as any} size={22} color="#fff" />
                </LinearGradient>
              ) : (
                <View className="w-11 h-11 rounded-full justify-center items-center">
                  <Ionicons name={`${item.icon}-outline` as any} size={22} color={theme.colors.textSecondary} />
                </View>
              )}
              <Text className={`text-[10px] font-semibold mt-0.5 ${active ? "text-blue-500" : "text-slate-500"}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
