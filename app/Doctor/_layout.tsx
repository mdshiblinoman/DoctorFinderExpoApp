import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import DoctorBottomNav from "../DoctorBottomNav/doctorComponents";

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Slot />
      <DoctorBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
});
