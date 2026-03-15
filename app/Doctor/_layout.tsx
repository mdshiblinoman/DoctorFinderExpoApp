import { Slot } from "expo-router";
import { View } from "react-native";
import DoctorBottomNav from "../DoctorBottomNav/doctorComponents";

export default function TabsLayout() {
  return (
    <View className="flex-1 relative">
      <Slot />
      <DoctorBottomNav />
    </View>
  );
}
