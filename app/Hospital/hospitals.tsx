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
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNav from "../ButtonNav/components";

export default function HospitalScreen() {
  const [hospitals, setHospitals] = useState<string[]>([]);
  const [filteredHospitals, setFilteredHospitals] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const doctorsRef = ref(db, "doctors");
    const unsubscribe = onValue(doctorsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const hospitalSet = new Set<string>();

        Object.values<any>(data).forEach((doc) => {
          if (doc.hospital && doc.hospital.trim() !== "") {
            hospitalSet.add(doc.hospital.trim());
          }
        });

        const hospitalList = Array.from(hospitalSet).sort();
        setHospitals(hospitalList);
        setFilteredHospitals(hospitalList);
      } else {
        setHospitals([]);
        setFilteredHospitals([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = (text: string) => {
    setSearch(text);
    if (text.trim() === "") {
      setFilteredHospitals(hospitals);
    } else {
      const filtered = hospitals.filter((item) => item.toLowerCase().includes(text.toLowerCase()));
      setFilteredHospitals(filtered);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text className="mt-4 text-sm text-slate-500">Loading hospitals...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      <BackButton title="Hospitals" />

      <View className="px-4 py-4">
        <View className="flex-row items-center bg-white rounded-2xl px-4 py-2" style={theme.shadow}>
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            className="flex-1 ml-2 text-sm text-slate-800 py-1"
            placeholder="Search hospitals..."
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

      {filteredHospitals.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="business-outline" size={64} color={theme.colors.muted} />
          <Text className="text-base text-slate-500 mt-4">No hospitals found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredHospitals}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: theme.spacing.md, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center bg-white p-4 rounded-2xl mb-2"
              style={theme.shadow}
              onPress={() =>
                router.push({
                  pathname: "/Hospital/hospitalDoctors",
                  params: { hospital: item },
                })
              }
              activeOpacity={0.7}
            >
              <View className="w-[50px] h-[50px] rounded-full bg-slate-50 items-center justify-center mr-4">
                <Ionicons name="business" size={24} color={theme.colors.secondary} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-800">{item}</Text>
                <Text className="text-xs text-emerald-500 mt-0.5">View doctors -&gt;</Text>
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
