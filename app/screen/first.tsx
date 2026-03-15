import { theme } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  const [roleSelected, setRoleSelected] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);

  return (
    <View className="flex-1 justify-end items-center p-6 bg-black">
      <Animated.View className="absolute inset-0" style={{ opacity: fade }}>
        <LinearGradient
          colors={["#93C5FD", "#A7F3D0", "#5EEAD4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0"
        />
      </Animated.View>

      <View pointerEvents="none" className="absolute inset-0 flex-col">
        <View className="flex-1 items-center justify-center" />
        <View className="flex-1 items-center justify-center" />
        <View className="flex-1 items-center justify-center" />
        <View className="flex-1 items-center justify-center" />
        <View className="flex-1 items-center justify-center">
          <Text className="text-[30px] font-extrabold text-white tracking-[0.3px] text-center">
            Connect <Text className="text-emerald-500">Care</Text>
          </Text>
        </View>
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-slate-200 text-center px-6">
            Your gateway to health appointments and professional management.
          </Text>
        </View>
        <View className="flex-1 items-center justify-center" />
      </View>

      <View className="w-full max-w-[480px] items-center pb-8">
        <BlurView intensity={40} tint="light" className="w-full rounded-3xl overflow-hidden" style={theme.shadow}>
          <View className="w-full bg-white/90 p-6 rounded-3xl border border-slate-200">
            <Text className="text-lg font-bold text-slate-900 text-center mb-4">How would you like to proceed?</Text>

            <View className={isWide ? 'w-full flex-row gap-4' : 'w-full'}>
              <TouchableOpacity
                onPress={() => {
                  setRoleSelected('Patient');
                  setTimeout(() => {
                    router.push('/Home/(tabs)/home');
                    setRoleSelected(null);
                  }, 500);
                }}
                className="w-full rounded-xl border-2 border-blue-500 p-4 mb-4 bg-white"
                activeOpacity={0.9}
              >
                <View className="flex-row items-center mb-1">
                  <Feather name="search" size={24} color="#2563EB" />
                  <Text className="text-lg font-bold ml-2 text-blue-900">I am a Patient</Text>
                </View>
                <Text className="text-[13px] leading-[18px] text-gray-600">
                  Find and book a doctor based on specialty, location, and rating in real-time.
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setRoleSelected('Doctor');
                  setTimeout(() => {
                    router.push('/screen/login');
                    setRoleSelected(null);
                  }, 500);
                }}
                className="w-full rounded-xl border-2 border-slate-200 p-4 mb-4 bg-white"
                activeOpacity={0.9}
              >
                <View className="flex-row items-center mb-1">
                  <MaterialCommunityIcons name="doctor" size={26} color="#111827" />
                  <Text className="text-lg font-bold ml-2 text-gray-900">I am a Doctor</Text>
                </View>
                <Text className="text-[13px] leading-[18px] text-gray-600">
                  Manage your calendar, accept booking requests, and update your professional profile.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}
