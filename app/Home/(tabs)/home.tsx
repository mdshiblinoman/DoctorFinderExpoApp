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
  ScrollView,
} from "react-native";
import BottomNav from "../../ButtonNav/components";

const SPECIALTIES = [
  { id: '1', name: 'Cardiologist', icon: 'heart-pulse' },
  { id: '2', name: 'Neurologist', icon: 'brain' },
  { id: '3', name: 'Dentist', icon: 'tooth-outline' },
  { id: '4', name: 'Orthopedic', icon: 'bone' },
  { id: '5', name: 'Pediatrician', icon: 'baby-face-outline' },
  { id: '6', name: 'General', icon: 'medical-bag' },
];

const QUICK_ACTIONS = [
  { id: '1', name: 'Find a Doctor', icon: 'account-search', color: '#3b82f6', bgColor: 'bg-blue-50', route: 'search', description: 'Search specialists' },
  { id: '2', name: 'Appointments', icon: 'calendar-check', color: '#10b981', bgColor: 'bg-emerald-50', route: '/Booking/appointments', description: 'Your schedule' },
  { id: '3', name: 'Favorites', icon: 'heart', color: '#f43f5e', bgColor: 'bg-rose-50', route: '/Home/(tabs)/favorites', description: 'Saved doctors' },
  { id: '4', name: 'Medical Records', icon: 'file-document-outline', color: '#8b5cf6', bgColor: 'bg-violet-50', route: '/Home/(tabs)/records', description: 'Health files' },
];

export default function HomeScreen() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const { width } = useWindowDimensions();
  const defaultLogo = "https://cdn-icons-png.flaticon.com/512/3774/3774299.png";
  const userAvatar = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

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

  const renderHeader = () => (
    <View className="bg-slate-50">
      {/* Top Header */}
      <View className="flex-row items-center justify-between px-6 pt-6 pb-2" style={{ paddingTop: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 0) + 20 }}>
        <View className="flex-row items-center gap-3">
          <Image
            source={{ uri: userAvatar }}
            className="h-12 w-12 rounded-full border-2 border-slate-200 bg-white"
          />
          <View>
            <Text className="text-sm text-slate-500">Good Morning,</Text>
            <Text className="text-lg font-bold text-slate-800">User Name</Text>
          </View>
        </View>
        <TouchableOpacity className="relative rounded-full bg-white p-2.5 shadow-sm border border-slate-100">
          <Ionicons name="notifications-outline" size={22} color={theme.colors.textSecondary} />
          <View className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
        </TouchableOpacity>
      </View>

      {/* Search Section */}
      <View className="px-6 py-4">
        <View className="flex-row items-center rounded-2xl bg-white px-4 py-3 shadow-sm border border-slate-100">
          <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
          <TextInput
            className="flex-1 px-3 text-base text-slate-800"
            placeholder="Search doctors, specialties..."
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

      {/* Specialties */}
      <View className="py-2">
        <View className="mb-4 flex-row items-center justify-between px-6">
          <Text className="text-lg font-bold text-slate-800">Specialties</Text>
          <TouchableOpacity>
            <Text className="text-sm font-semibold text-blue-600">See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {SPECIALTIES.map((item) => (
            <TouchableOpacity key={item.id} className="mr-5 items-center" onPress={() => setSearch(item.name)} activeOpacity={0.7}>
              <View className="mb-2 h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm border border-slate-100">
                <MaterialCommunityIcons name={item.icon as any} size={28} color={theme.colors.primary} />
              </View>
              <Text className="text-xs font-medium text-slate-600">{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Find Doctor Banner */}
      <View className="px-6 py-6">
        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="overflow-hidden rounded-3xl p-6 shadow-md flex-row"
        >
          <View className="flex-1 justify-center z-10 py-2">
            <Text className="text-xl font-bold text-white mb-2">Find the Right{"\n"}Doctor for You</Text>
            <Text className="text-xs text-white/90 mb-4 leading-relaxed">Connect with qualified doctors and get the care you need.</Text>
            <TouchableOpacity className="bg-white rounded-full px-5 py-2.5 self-start shadow-sm" activeOpacity={0.8}>
              <Text className="text-sm font-bold text-blue-600">Find a Doctor</Text>
            </TouchableOpacity>
          </View>
          <View className="absolute right-[-20px] bottom-[-20px] opacity-20">
            <MaterialCommunityIcons name="stethoscope" size={140} color="#fff" />
          </View>
        </LinearGradient>
      </View>

      {/* Quick Actions */}
      <View className="px-6 py-2 pb-6">
        <View className="flex-row flex-wrap justify-between">
          {QUICK_ACTIONS.map((item) => (
            <TouchableOpacity
              key={item.id}
              className="mb-4 w-[48%] rounded-[20px] bg-white p-4 shadow-sm border border-slate-100"
              activeOpacity={0.7}
              onPress={() => {
                if (item.route.startsWith('/')) router.push(item.route as any);
              }}
            >
              <View className="mb-3 flex-row items-center justify-between">
                <View className={`h-12 w-12 items-center justify-center rounded-full ${item.bgColor}`}>
                  <MaterialCommunityIcons name={item.icon as any} size={26} color={item.color} />
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
              </View>
              <Text className="text-sm font-bold text-slate-800">{item.name}</Text>
              <Text className="text-xs text-slate-500 mt-1">{item.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Available Doctors Header */}
      <View className="mb-4 flex-row items-center justify-between px-6 pt-2">
        <Text className="text-lg font-bold text-slate-800">Available Doctors</Text>
        <TouchableOpacity>
          <Text className="text-sm font-semibold text-blue-600">See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderDoctorCard = ({ item }: { item: any }) => {
    const isGrid = numColumns > 1;
    return (
      <View
        className={`mb-4 overflow-hidden rounded-3xl bg-white p-4 shadow-sm border border-slate-100 ${isGrid ? 'items-center' : 'flex-row mx-6'}`}
        style={isGrid ? { width: `${100 / numColumns - 2}%` } : undefined}
      >
        <View className={`relative ${isGrid ? 'mb-4' : 'mr-4'}`}>
          <Image
            source={{ uri: item.photoURL || defaultLogo }}
            className={`${isGrid ? 'h-20 w-20 rounded-full' : 'h-24 w-24 rounded-2xl'} bg-slate-100`}
          />
          <View className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5 shadow-sm">
            <View className="h-3.5 w-3.5 rounded-full border-2 border-white" style={{ backgroundColor: item.status === 'active' ? theme.colors.success : theme.colors.warning }} />
          </View>
        </View>

        <View className={`flex-1 ${isGrid ? 'items-center w-full' : 'justify-between'}`}>
          <View className={isGrid ? 'items-center w-full' : ''}>
            <View className={`flex-row items-center ${isGrid ? 'justify-center' : 'justify-between'} w-full`}>
              <Text className="text-base font-bold text-slate-800" numberOfLines={1}>{item.name}</Text>
              {!isGrid && (
                <TouchableOpacity>
                  <Ionicons name="heart-outline" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            <Text className="text-sm font-semibold text-blue-600 mt-1" numberOfLines={1}>{item.department}</Text>
            <Text className={`text-xs text-slate-500 mt-1 ${isGrid ? 'text-center' : ''}`} numberOfLines={1}>{item.degree} • {item.experience || "10+"} Yrs Exp</Text>
            <Text className={`text-xs text-slate-500 mt-1.5 ${isGrid ? 'text-center' : ''}`} numberOfLines={1}>
              <Ionicons name="location-outline" size={12} color={theme.colors.textSecondary} /> {item.hospital}
            </Text>
          </View>

          <View className={`mt-3 flex-row items-center ${isGrid ? 'justify-center w-full' : 'justify-between'}`}>
            {!isGrid && <Text className="text-sm font-bold text-slate-800">${item.fee || 50}</Text>}
            <View className={`flex-row ${isGrid ? 'w-full justify-between' : 'gap-2'}`}>
              <TouchableOpacity
                className="rounded-full border border-blue-100 bg-white px-3 py-1.5"
                onPress={() =>
                  router.push({
                    pathname: "/Home/(tabs)/doctorDetails",
                    params: { uid: item.uid },
                  })
                }
              >
                <Text className="text-xs font-semibold text-blue-600">Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="rounded-full bg-blue-50 px-3 py-1.5"
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
                <Text className="text-xs font-semibold text-blue-600">Book</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <FlatList
        data={filteredDoctors}
        numColumns={numColumns}
        key={numColumns}
        keyExtractor={(item: any, index) => item.uid || index.toString()}
        contentContainerClassName="pb-32"
        columnWrapperStyle={numColumns > 1 ? { justifyContent: "space-between", paddingHorizontal: 24 } : undefined}
        renderItem={renderDoctorCard}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-10 py-12">
            <Ionicons name="search-outline" size={64} color={theme.colors.muted} />
            <Text className="mt-6 text-2xl font-semibold text-slate-800">No doctors found</Text>
            <Text className="mt-2 text-center text-base text-slate-500">Try searching with different keywords or specialties</Text>
          </View>
        }
      />

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
          className="h-[60px] w-[60px] items-center justify-center rounded-full shadow-lg"
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
