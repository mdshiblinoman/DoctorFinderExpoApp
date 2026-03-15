import { theme } from "@/constants/theme";
import { auth, db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";

interface ValidationErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  department?: string;
  hospital?: string;
  degree?: string;
  appointmentTime?: string;
  place?: string;
  registrationNumber?: string;
  dob?: string;
}

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [department, setDepartment] = useState("");
  const [hospital, setHospital] = useState("");
  const [degree, setDegree] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [place, setPlace] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
    validateField("password", password);
    if (confirmPassword) validateField("confirmPassword", confirmPassword);
  }, [password]);

  useEffect(() => {
    if (confirmPassword) validateField("confirmPassword", confirmPassword);
  }, [confirmPassword]);

  const validateField = (field: string, value: string): string | null => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Full name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        if (!/^[a-zA-Z\s.]+$/.test(value)) return "Name can only contain letters, spaces and dots";
        return null;
      case "phone":
        if (!value) return "Phone number is required";
        if (!/^\d+$/.test(value)) return "Phone must contain only digits";
        if (value.length !== 11) return "Phone number must be exactly 11 digits";
        return null;
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email address";
        return null;
      case "password":
        if (!value) return "Password is required";
        if (value.length < 6) return "Password must be at least 6 characters";
        if (value.length < 8) return "Tip: Use 8+ characters for a stronger password";
        return null;
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== password) return "Passwords do not match";
        return null;
      case "department":
        if (!value.trim()) return "Department/Specialty is required";
        if (value.trim().length < 2) return "Please enter a valid department";
        return null;
      case "hospital":
        if (!value.trim()) return "Hospital/Clinic name is required";
        if (value.trim().length < 3) return "Please enter a valid hospital name";
        return null;
      case "degree":
        if (!value.trim()) return "Degree/Qualification is required";
        if (value.trim().length < 2) return "Please enter a valid degree";
        return null;
      case "registrationNumber":
        if (!value.trim()) return "BMDC Registration number is required";
        if (value.trim().length < 4) return "Please enter a valid registration number";
        return null;
      case "place":
        if (!value.trim()) return "Chamber/Practice location is required";
        if (value.trim().length < 3) return "Please enter a valid location";
        return null;
      case "dob": {
        if (!value) return "Date of birth is required";
        const age = calculateAge(value);
        if (age < 18) return "You must be at least 18 years old";
        if (age > 100) return "Please enter a valid date of birth";
        return null;
      }
      case "appointmentTime":
        if (!value) return "Appointment time is required";
        return null;
      default:
        return null;
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error || undefined }));
  };

  const handleChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error || undefined }));
    }
  };

  const onDateChange = (_event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      setDob(formattedDate);
      setTouched((prev) => ({ ...prev, dob: true }));
      const error = validateField("dob", formattedDate);
      setErrors((prev) => ({ ...prev, dob: error || undefined }));
    }
  };

  const onTimeChange = (_event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const formattedTime = `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}:${minutes
        .toString()
        .padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
      setAppointmentTime(formattedTime);
      setTouched((prev) => ({ ...prev, appointmentTime: true }));
      setErrors((prev) => ({ ...prev, appointmentTime: undefined }));
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateInputs = () => {
    const newErrors: ValidationErrors = {};
    const fields = [
      { key: "name", value: name },
      { key: "phone", value: phone },
      { key: "email", value: email },
      { key: "password", value: password },
      { key: "confirmPassword", value: confirmPassword },
      { key: "department", value: department },
      { key: "hospital", value: hospital },
      { key: "degree", value: degree },
      { key: "registrationNumber", value: registrationNumber },
      { key: "place", value: place },
      { key: "dob", value: dob },
      { key: "appointmentTime", value: appointmentTime },
    ];

    const allTouched: { [key: string]: boolean } = {};
    fields.forEach((f) => {
      allTouched[f.key] = true;
      const error = validateField(f.key, f.value);
      if (error && !error.startsWith("Tip:")) {
        newErrors[f.key as keyof ValidationErrors] = error;
      }
    });

    setTouched(allTouched);
    setErrors(newErrors);

    const firstError = Object.values(newErrors)[0];
    return firstError || null;
  };

  const isFormValid = () => {
    const requiredFields = [
      name,
      phone,
      email,
      password,
      confirmPassword,
      department,
      hospital,
      degree,
      registrationNumber,
      place,
      dob,
      appointmentTime,
    ];
    return requiredFields.every((f) => f.trim() !== "") && password === confirmPassword && password.length >= 6;
  };

  const getPasswordStrengthInfo = () => {
    if (passwordStrength <= 1) return { label: "Weak", color: "#dc3545" };
    if (passwordStrength <= 2) return { label: "Fair", color: "#fd7e14" };
    if (passwordStrength <= 3) return { label: "Good", color: "#ffc107" };
    if (passwordStrength <= 4) return { label: "Strong", color: "#28a745" };
    return { label: "Very Strong", color: "#20c997" };
  };

  const handleSignup = async () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const age = calculateAge(dob);

      await set(ref(db, "doctors/" + user.uid), {
        uid: user.uid,
        name,
        phone,
        email,
        department,
        hospital,
        degree,
        appointmentTime,
        place,
        registrationNumber,
        dob,
        age,
        role: "doctor",
        status: "active",
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Account created successfully!");
      router.replace("/screen/login");
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const fieldContainerClass = (hasError: boolean) =>
    `mb-1 flex-row items-center rounded-xl border bg-white px-4 shadow-sm ${hasError ? "border-rose-500 bg-rose-50" : "border-slate-200"}`;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-slate-50"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <BackButton title="Sign Up" />
        <ScrollView contentContainerClassName="flex-grow bg-slate-50 px-6 pb-16" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View className="mb-8 mt-6 items-center">
            <LinearGradient colors={theme.colors.gradientPrimary} className="mb-4 h-[70px] w-[70px] items-center justify-center rounded-full">
              <Ionicons name="medical" size={32} color="#fff" />
            </LinearGradient>
            <Text className="mb-1 text-4xl font-bold text-slate-800">Create Account</Text>
            <Text className="mt-1 text-base text-slate-500">Sign up as a Doctor</Text>
          </View>

          <View className="mb-6">
            <Text className="mb-4 pl-1 text-lg font-bold text-slate-800">Personal Information</Text>

            <View className={fieldContainerClass(!!(touched.name && errors.name))}>
              <Ionicons name="person-outline" size={20} color={touched.name && errors.name ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Full Name *"
                value={name}
                onChangeText={(v) => handleChange("name", v, setName)}
                onBlur={() => handleBlur("name", name)}
                className="flex-1 py-4 text-base text-slate-800"
                placeholderTextColor="#999"
              />
              {touched.name && !errors.name && name && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.name && errors.name && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.name}</Text>}

            <View className={fieldContainerClass(!!(touched.phone && errors.phone))}>
              <Ionicons name="call-outline" size={20} color={touched.phone && errors.phone ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Phone Number (11 digits) *"
                value={phone}
                onChangeText={(v) => handleChange("phone", v.replace(/[^0-9]/g, ""), setPhone)}
                onBlur={() => handleBlur("phone", phone)}
                className="flex-1 py-4 text-base text-slate-800"
                keyboardType="phone-pad"
                maxLength={11}
                placeholderTextColor="#999"
              />
              {touched.phone && !errors.phone && phone && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.phone && errors.phone && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.phone}</Text>}

            <View className={fieldContainerClass(!!(touched.email && errors.email))}>
              <Ionicons name="mail-outline" size={20} color={touched.email && errors.email ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Email Address *"
                value={email}
                onChangeText={(v) => handleChange("email", v, setEmail)}
                onBlur={() => handleBlur("email", email)}
                className="flex-1 py-4 text-base text-slate-800"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              {touched.email && !errors.email && email && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.email && errors.email && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.email}</Text>}

            <TouchableOpacity className={fieldContainerClass(!!(touched.dob && errors.dob))} onPress={() => setShowDatePicker(true)}>
              <Ionicons name="calendar-outline" size={20} color={touched.dob && errors.dob ? "#dc3545" : "#666"} className="mr-2" />
              <Text className={`flex-1 py-4 text-base ${dob ? "text-slate-800" : "text-slate-400"}`}>{dob || "Date of Birth *"}</Text>
              {touched.dob && !errors.dob && dob && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </TouchableOpacity>
            {touched.dob && errors.dob && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.dob}</Text>}

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          <View className="mb-6">
            <Text className="mb-4 pl-1 text-lg font-bold text-slate-800">Account Security</Text>

            <View className={fieldContainerClass(!!(touched.password && errors.password && !errors.password.startsWith("Tip:")))}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={touched.password && errors.password && !errors.password.startsWith("Tip:") ? "#dc3545" : "#666"}
                className="mr-2"
              />
              <TextInput
                placeholder="Password (min 6 characters) *"
                value={password}
                onChangeText={(v) => handleChange("password", v, setPassword)}
                onBlur={() => handleBlur("password", password)}
                className="flex-1 py-4 text-base text-slate-800"
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity className="mr-1 p-2" onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
              {touched.password && !errors.password && password && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.password && errors.password && (
              <Text className={`mb-3 ml-1 text-xs ${errors.password.startsWith("Tip:") ? "text-amber-500" : "text-rose-500"}`}>
                {errors.password}
              </Text>
            )}

            {password.length > 0 && (
              <View className="mb-4 mt-1 flex-row items-center px-1">
                <View className="mr-2 flex-1 flex-row">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      className="mr-1 h-1 flex-1 rounded"
                      style={{ backgroundColor: level <= passwordStrength ? getPasswordStrengthInfo().color : "#e0e0e0" }}
                    />
                  ))}
                </View>
                <Text className="min-w-[70px] text-right text-xs font-semibold" style={{ color: getPasswordStrengthInfo().color }}>
                  {getPasswordStrengthInfo().label}
                </Text>
              </View>
            )}

            <View className={fieldContainerClass(!!(touched.confirmPassword && errors.confirmPassword))}>
              <Ionicons name="lock-closed-outline" size={20} color={touched.confirmPassword && errors.confirmPassword ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChangeText={(v) => handleChange("confirmPassword", v, setConfirmPassword)}
                onBlur={() => handleBlur("confirmPassword", confirmPassword)}
                className="flex-1 py-4 text-base text-slate-800"
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity className="mr-1 p-2" onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
              {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.confirmPassword && errors.confirmPassword && (
              <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.confirmPassword}</Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="mb-4 pl-1 text-lg font-bold text-slate-800">Professional Information</Text>

            <View className={fieldContainerClass(!!(touched.department && errors.department))}>
              <Ionicons name="medical-outline" size={20} color={touched.department && errors.department ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Department/Specialty *"
                value={department}
                onChangeText={(v) => handleChange("department", v, setDepartment)}
                onBlur={() => handleBlur("department", department)}
                className="flex-1 py-4 text-base text-slate-800"
                placeholderTextColor="#999"
              />
              {touched.department && !errors.department && department && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.department && errors.department && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.department}</Text>}

            <View className={fieldContainerClass(!!(touched.hospital && errors.hospital))}>
              <Ionicons name="business-outline" size={20} color={touched.hospital && errors.hospital ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Hospital/Clinic Name *"
                value={hospital}
                onChangeText={(v) => handleChange("hospital", v, setHospital)}
                onBlur={() => handleBlur("hospital", hospital)}
                className="flex-1 py-4 text-base text-slate-800"
                placeholderTextColor="#999"
              />
              {touched.hospital && !errors.hospital && hospital && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.hospital && errors.hospital && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.hospital}</Text>}

            <View className={fieldContainerClass(!!(touched.degree && errors.degree))}>
              <Ionicons name="school-outline" size={20} color={touched.degree && errors.degree ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Degree/Qualification *"
                value={degree}
                onChangeText={(v) => handleChange("degree", v, setDegree)}
                onBlur={() => handleBlur("degree", degree)}
                className="flex-1 py-4 text-base text-slate-800"
                placeholderTextColor="#999"
              />
              {touched.degree && !errors.degree && degree && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.degree && errors.degree && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.degree}</Text>}

            <View className={fieldContainerClass(!!(touched.registrationNumber && errors.registrationNumber))}>
              <Ionicons name="card-outline" size={20} color={touched.registrationNumber && errors.registrationNumber ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="BMDC Registration Number *"
                value={registrationNumber}
                onChangeText={(v) => handleChange("registrationNumber", v, setRegistrationNumber)}
                onBlur={() => handleBlur("registrationNumber", registrationNumber)}
                className="flex-1 py-4 text-base text-slate-800"
                placeholderTextColor="#999"
              />
              {touched.registrationNumber && !errors.registrationNumber && registrationNumber && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.registrationNumber && errors.registrationNumber && (
              <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.registrationNumber}</Text>
            )}

            <View className={fieldContainerClass(!!(touched.place && errors.place))}>
              <Ionicons name="location-outline" size={20} color={touched.place && errors.place ? "#dc3545" : "#666"} className="mr-2" />
              <TextInput
                placeholder="Chamber/Practice Location *"
                value={place}
                onChangeText={(v) => handleChange("place", v, setPlace)}
                onBlur={() => handleBlur("place", place)}
                className="flex-1 py-4 text-base text-slate-800"
                placeholderTextColor="#999"
              />
              {touched.place && !errors.place && place && <Ionicons name="checkmark-circle" size={20} color="#28a745" />}
            </View>
            {touched.place && errors.place && <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.place}</Text>}

            <TouchableOpacity className={fieldContainerClass(!!(touched.appointmentTime && errors.appointmentTime))} onPress={() => setShowTimePicker(true)}>
              <Ionicons
                name="time-outline"
                size={20}
                color={touched.appointmentTime && errors.appointmentTime ? "#dc3545" : "#666"}
                className="mr-2"
              />
              <Text className={`flex-1 py-4 text-base ${appointmentTime ? "text-slate-800" : "text-slate-400"}`}>
                {appointmentTime || "Appointment Time *"}
              </Text>
              {touched.appointmentTime && !errors.appointmentTime && appointmentTime && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </TouchableOpacity>
            {touched.appointmentTime && errors.appointmentTime && (
              <Text className="mb-3 ml-1 text-xs text-rose-500">{errors.appointmentTime}</Text>
            )}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}
          </View>

          <View className="mb-2 items-center">
            <Text className="text-sm italic text-slate-500">* All fields are required</Text>
          </View>

          <TouchableOpacity
            className={`mb-4 mt-4 overflow-hidden rounded-2xl shadow-lg ${loading || !isFormValid() ? "opacity-80" : ""}`}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isFormValid() && !loading ? theme.colors.gradientSecondary : ["#d1d5db", "#9ca3af"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="flex-row items-center justify-center gap-2 py-5"
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Ionicons name="person-add-outline" size={20} color="#fff" />
              )}
              <Text className="text-lg font-bold text-white">{loading ? "Creating Account..." : "Sign Up"}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity className="mb-8 items-center py-4" onPress={() => router.replace("/screen/login")}>
            <Text className="text-base text-slate-500">
              Already have an account? <Text className="font-semibold text-blue-600">Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
