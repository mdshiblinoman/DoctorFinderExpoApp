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
    <View className="mb-4 overflow-hidden rounded-2xl bg-white shadow" style={numColumns > 1 ? { width: `${100 / numColumns - 2}%` } : undefined}>
      <View className="relative items-center pt-6">
        <Image
          source={{ uri: item.photoURL || defaultLogo }}
          className="h-20 w-20 rounded-full border-2 border-blue-100"
        />
        <View className="absolute bottom-0 right-[35%] rounded-full bg-white p-1">
          <View className="h-3 w-3 rounded-full" style={{ backgroundColor: item.status === 'active' ? theme.colors.success : theme.colors.warning }} />
        </View>
      </View>

      <View className="items-center p-4">
        <Text className="mb-2 text-lg font-bold text-slate-800" numberOfLines={1}>{item.name}</Text>

        <View className="mb-1 flex-row items-center gap-1">
          <Ionicons name="school-outline" size={14} color={theme.colors.textSecondary} />
          <Text className="text-sm text-slate-500" numberOfLines={1}>{item.degree}</Text>
        </View>

        <View className="mb-1 flex-row items-center gap-1">
          <Ionicons name="medical-outline" size={14} color={theme.colors.primary} />
          <Text className="text-sm font-semibold text-blue-600" numberOfLines={1}>{item.department}</Text>
        </View>

        <View className="mb-1 flex-row items-center gap-1">
          <Ionicons name="business-outline" size={14} color={theme.colors.textSecondary} />
          <Text className="text-sm text-slate-500" numberOfLines={1}>{item.hospital}</Text>
        </View>
      </View>

      <View className="flex-row border-t border-slate-200">
        <TouchableOpacity
          className="flex-1 flex-row items-center justify-center gap-1 py-4"
          onPress={() =>
            router.push({
              pathname: "/Home/(tabs)/doctorDetails",
              params: { uid: item.uid },
            })
          }
          activeOpacity={0.7}
        >
          <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} />
          <Text className="text-sm font-semibold text-blue-600">Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1"
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
            className="flex-row items-center justify-center gap-1 py-4"
          >
            <Ionicons name="calendar-outline" size={16} color="#fff" />
            <Text className="text-sm font-semibold text-white">Book</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-base text-slate-500">Loading doctors...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-3xl px-6 pb-6"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }}
      >
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white">Find Your Doctor</Text>
          <Text className="mt-1 text-base text-white/80">{doctors.length} doctors available</Text>
        </View>

        {/* Search Bar */}
        <View className="mt-2">
          <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow">
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              className="flex-1 px-2 text-base text-slate-800"
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
        <View className="flex-1 items-center justify-center px-10">
          <Ionicons name="search-outline" size={64} color={theme.colors.muted} />
          <Text className="mt-6 text-2xl font-semibold text-slate-800">No doctors found</Text>
          <Text className="mt-2 text-center text-base text-slate-500">Try searching with different keywords</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          numColumns={numColumns}
          key={numColumns}
          keyExtractor={(item: any, index) => item.uid || index.toString()}
          contentContainerClassName="p-4 pb-32"
          columnWrapperStyle={numColumns > 1 ? { justifyContent: "space-between" } : undefined}
          renderItem={renderDoctorCard}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating AI Chat Button */}
      <TouchableOpacity
        className="absolute bottom-[100px] right-6 z-[100]"
        onPress={() => router.push("/Home/(tabs)/aiChat")}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={theme.colors.gradientAccent}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="h-[60px] w-[60px] items-center justify-center rounded-full"
        >
          <MaterialCommunityIcons name="robot-happy-outline" size={26} color="#fff" />
        </LinearGradient>
        <View className="absolute right-0 top-0 h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-amber-500">
          <Ionicons name="sparkles" size={10} color="#fff" />
        </View>
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
}
