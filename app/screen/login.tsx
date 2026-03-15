import { theme } from "@/constants/theme";
import { auth } from "@/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Email Required",
        "Please enter your email address to receive a password reset link."
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert(
        "Password Reset Email Sent",
        `A password reset link has been sent to ${email}. Please check your inbox and spam folder.`
      );
    } catch (error: any) {
      let errorMessage = "Failed to send password reset email.";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email address.";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please try again later.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Please enter a valid email address.";
      }
      Alert.alert("Error", errorMessage);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      Alert.alert('Login Successful');
      router.push('/Doctor/doctorHome');
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      <LinearGradient
        colors={theme.colors.gradientPrimary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-b-3xl px-6 pb-10"
        style={{ paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 10 }}
      >
        <TouchableOpacity
          className="mb-6 h-11 w-11 items-center justify-center rounded-full bg-white/20"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>

        <View className="items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-white/20">
            <Ionicons name="medical" size={40} color="#fff" />
          </View>
          <Text className="text-4xl font-bold text-white">Welcome Back</Text>
          <Text className="mt-1 text-base text-white/80">Sign in to continue</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="px-6 pt-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-6">
            <Text className="mb-2 text-base font-semibold text-slate-800">Email Address</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
              <Ionicons name="mail-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                className="flex-1 px-2 py-4 text-base text-slate-800"
                autoCapitalize="none"
                placeholderTextColor={theme.colors.textLight}
              />
            </View>
          </View>

          <View className="mb-6">
            <Text className="mb-2 text-base font-semibold text-slate-800">Password</Text>
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-white px-4 shadow-sm">
              <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} />
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                className="flex-1 px-2 py-4 text-base text-slate-800"
                placeholderTextColor={theme.colors.textLight}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity onPress={handleForgotPassword} className="mb-8 flex-row items-center justify-end gap-1">
            <Ionicons name="key-outline" size={16} color={theme.colors.primary} />
            <Text className="text-sm font-semibold text-blue-600">Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogin}
            className={`overflow-hidden rounded-xl ${loading ? "opacity-70" : ""}`}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={theme.colors.gradientPrimary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center gap-2 py-4"
            >
              {loading ? (
                <Text className="text-lg font-bold text-white">Signing in...</Text>
              ) : (
                <>
                  <Text className="text-lg font-bold text-white">Sign In</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View className="my-8 flex-row items-center">
            <View className="h-px flex-1 bg-slate-200" />
            <Text className="px-4 text-sm text-slate-500">or</Text>
            <View className="h-px flex-1 bg-slate-200" />
          </View>

          <TouchableOpacity
            className="items-center py-4"
            onPress={() => router.push('/screen/signup')}
          >
            <Text className="text-base text-slate-500">
              Don't have an account? <Text className="font-bold text-blue-600">Sign up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
