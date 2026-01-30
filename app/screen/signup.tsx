import { auth, db } from "@/firebaseConfig";
import BackButton from "@/components/BackButton";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";
import React, { useState, useEffect } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import { sendOTPviaSMS } from "@/services/emailService";

// Validation error interface
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
  const [dob, setDob] = useState(""); // YYYY-MM-DD format
  const [loading, setLoading] = useState(false);

  // Validation states
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Date and Time Picker states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Email verification states
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // ✅ Calculate password strength
  const calculatePasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 6) strength += 1;
    if (pwd.length >= 8) strength += 1;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 1;
    if (/\d/.test(pwd)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) strength += 1;
    return strength;
  };

  // ✅ Real-time validation effect
  useEffect(() => {
    setPasswordStrength(calculatePasswordStrength(password));
    validateField("password", password);
    if (confirmPassword) validateField("confirmPassword", confirmPassword);
  }, [password]);

  useEffect(() => {
    if (confirmPassword) validateField("confirmPassword", confirmPassword);
  }, [confirmPassword]);

  // ✅ Field validators
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

      case "dob":
        if (!value) return "Date of birth is required";
        const age = calculateAge(value);
        if (age < 18) return "You must be at least 18 years old";
        if (age > 100) return "Please enter a valid date of birth";
        return null;

      case "appointmentTime":
        if (!value) return "Appointment time is required";
        return null;

      default:
        return null;
    }
  };

  // ✅ Handle field blur (mark as touched)
  const handleBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error || undefined }));
  };

  // ✅ Handle field change with real-time validation
  const handleChange = (field: string, value: string, setter: (v: string) => void) => {
    setter(value);
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors(prev => ({ ...prev, [field]: error || undefined }));
    }
  };

  // Handle date change
  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split("T")[0];
      setDob(formattedDate);
      setTouched(prev => ({ ...prev, dob: true }));
      const error = validateField("dob", formattedDate);
      setErrors(prev => ({ ...prev, dob: error || undefined }));
    }
  };

  // Handle time change
  const onTimeChange = (event: any, time?: Date) => {
    setShowTimePicker(false);
    if (time) {
      setSelectedTime(time);
      const hours = time.getHours();
      const minutes = time.getMinutes();
      const formattedTime = `${hours > 12 ? hours - 12 : hours === 0 ? 12 : hours}:${minutes.toString().padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
      setAppointmentTime(formattedTime);
      setTouched(prev => ({ ...prev, appointmentTime: true }));
      setErrors(prev => ({ ...prev, appointmentTime: undefined }));
    }
  };

  // ✅ calculate age from DOB
  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // ✅ Input validation
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

    // Mark all fields as touched
    const allTouched: { [key: string]: boolean } = {};
    fields.forEach(f => {
      allTouched[f.key] = true;
      const error = validateField(f.key, f.value);
      if (error && !error.startsWith("Tip:")) {
        newErrors[f.key as keyof ValidationErrors] = error;
      }
    });

    setTouched(allTouched);
    setErrors(newErrors);

    // Return first error message or null
    const firstError = Object.values(newErrors)[0];
    return firstError || null;
  };

  // ✅ Check if form is valid
  const isFormValid = () => {
    const requiredFields = [name, phone, email, password, confirmPassword, department, hospital, degree, registrationNumber, place, dob, appointmentTime];
    return requiredFields.every(f => f.trim() !== "") && password === confirmPassword && password.length >= 6 && isPhoneVerified;
  };

  // ✅ Get password strength label and color
  const getPasswordStrengthInfo = () => {
    if (passwordStrength <= 1) return { label: "Weak", color: "#dc3545" };
    if (passwordStrength <= 2) return { label: "Fair", color: "#fd7e14" };
    if (passwordStrength <= 3) return { label: "Good", color: "#ffc107" };
    if (passwordStrength <= 4) return { label: "Strong", color: "#28a745" };
    return { label: "Very Strong", color: "#20c997" };
  };

  // ✅ Generate 6-digit OTP
  const generateOtp = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // ✅ Resend timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ✅ Send verification SMS with OTP
  const handleSendVerificationCode = async () => {
    if (!phone) {
      Alert.alert("Phone Required", "Please enter your phone number first.");
      return;
    }

    const phoneError = validateField("phone", phone);
    if (phoneError) {
      Alert.alert("Invalid Phone", phoneError);
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError("");

      const otp = generateOtp();
      setGeneratedOtp(otp);

      // Format phone with Bangladesh country code (+880)
      const formattedPhone = phone.startsWith("0") ? `+88${phone}` : `+880${phone}`;

      const result = await sendOTPviaSMS(formattedPhone, otp, name || "User");

      if (result.success) {
        setShowOtpModal(true);
        setResendTimer(60); // 60 seconds cooldown
        Alert.alert(
          "Verification Code Sent",
          `A 6-digit verification code has been sent to ${phone} via SMS.`
        );
      } else {
        Alert.alert("Error", result.error || "Failed to send SMS. Please try again.");
      }
    } catch (error: any) {
      Alert.alert("Error", "Failed to send SMS. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ✅ Verify OTP code
  const handleVerifyOtp = () => {
    if (otpCode.length !== 6) {
      setOtpError("Please enter a 6-digit code");
      return;
    }

    if (otpCode === generatedOtp) {
      setIsPhoneVerified(true);
      setShowOtpModal(false);
      setOtpCode("");
      setOtpError("");
      Alert.alert("Success", "Email verified successfully!");
    } else {
      setOtpError("Invalid verification code. Please try again.");
    }
  };

  // ✅ Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    await handleSendVerificationCode();
  };

  // ✅ Signup function
  const handleSignup = async () => {
    const errorMessage = validateInputs();
    if (errorMessage) {
      Alert.alert("Validation Error", errorMessage);
      return;
    }

    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // calculate age from dob
      const age = calculateAge(dob);

      // Store doctor info in Firebase Realtime DB
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

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#f8f9fa' }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <BackButton title="Sign Up" />
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up as a Doctor</Text>
          </View>

          {/* Personal Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={[styles.inputContainer, touched.name && errors.name && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color={touched.name && errors.name ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Full Name *"
                value={name}
                onChangeText={(v) => handleChange("name", v, setName)}
                onBlur={() => handleBlur("name", name)}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {touched.name && !errors.name && name && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.name && errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <View style={[styles.inputContainer, touched.phone && errors.phone && styles.inputError]}>
              <Ionicons name="call-outline" size={20} color={touched.phone && errors.phone ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Phone Number (11 digits) *"
                value={phone}
                onChangeText={(v) => {
                  handleChange("phone", v.replace(/[^0-9]/g, ""), setPhone);
                  if (isPhoneVerified) setIsPhoneVerified(false); // Reset verification if phone changes
                }}
                onBlur={() => handleBlur("phone", phone)}
                style={styles.input}
                keyboardType="phone-pad"
                maxLength={11}
                placeholderTextColor="#999"
                editable={!isPhoneVerified}
              />
              {isPhoneVerified ? (
                <View style={styles.verifiedBadge}>
                  <Ionicons name="checkmark-circle" size={20} color="#28a745" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={handleSendVerificationCode}
                  style={styles.verifyButton}
                  disabled={otpLoading || !phone || phone.length !== 11}
                >
                  {otpLoading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Text style={[styles.verifyButtonText, (!phone || phone.length !== 11) && styles.verifyButtonDisabled]}>Verify</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
            {touched.phone && errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            {!isPhoneVerified && phone && phone.length === 11 && !errors.phone && (
              <Text style={styles.verifyHintText}>Please verify your phone number to continue</Text>
            )}

            <View style={[styles.inputContainer, touched.email && errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color={touched.email && errors.email ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Email Address *"
                value={email}
                onChangeText={(v) => handleChange("email", v, setEmail)}
                onBlur={() => handleBlur("email", email)}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#999"
              />
              {touched.email && !errors.email && email && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.email && errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {/* Date of Birth Picker */}
            <TouchableOpacity
              style={[styles.inputContainer, touched.dob && errors.dob && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color={touched.dob && errors.dob ? "#dc3545" : "#666"} style={styles.icon} />
              <Text style={[styles.input, !dob && styles.pickerText, dob && { color: "#333" }]}>
                {dob || "Date of Birth *"}
              </Text>
              {touched.dob && !errors.dob && dob && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </TouchableOpacity>
            {touched.dob && errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

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

          {/* Account Security Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Security</Text>

            <View style={[styles.inputContainer, touched.password && errors.password && !errors.password.startsWith("Tip:") && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={touched.password && errors.password && !errors.password.startsWith("Tip:") ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Password (min 6 characters) *"
                value={password}
                onChangeText={(v) => handleChange("password", v, setPassword)}
                onBlur={() => handleBlur("password", password)}
                style={styles.input}
                secureTextEntry={!showPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
              {touched.password && !errors.password && password && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.password && errors.password && (
              <Text style={[styles.errorText, errors.password.startsWith("Tip:") && styles.tipText]}>{errors.password}</Text>
            )}

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarContainer}>
                  {[1, 2, 3, 4, 5].map((level) => (
                    <View
                      key={level}
                      style={[
                        styles.strengthBar,
                        { backgroundColor: level <= passwordStrength ? getPasswordStrengthInfo().color : "#e0e0e0" }
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthText, { color: getPasswordStrengthInfo().color }]}>
                  {getPasswordStrengthInfo().label}
                </Text>
              </View>
            )}

            <View style={[styles.inputContainer, touched.confirmPassword && errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={touched.confirmPassword && errors.confirmPassword ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Confirm Password *"
                value={confirmPassword}
                onChangeText={(v) => handleChange("confirmPassword", v, setConfirmPassword)}
                onBlur={() => handleBlur("confirmPassword", confirmPassword)}
                style={styles.input}
                secureTextEntry={!showConfirmPassword}
                placeholderTextColor="#999"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
              </TouchableOpacity>
              {touched.confirmPassword && !errors.confirmPassword && confirmPassword && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.confirmPassword && errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* OTP Verification Modal */}
          <Modal
            visible={showOtpModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowOtpModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowOtpModal(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>

                <Ionicons name="mail-open-outline" size={60} color="#007AFF" style={styles.modalIcon} />
                <Text style={styles.modalTitle}>Verify Your Email</Text>
                <Text style={styles.modalSubtitle}>Enter the 6-digit code sent to</Text>
                <Text style={styles.modalEmail}>{email}</Text>

                <View style={styles.otpInputContainer}>
                  <TextInput
                    style={styles.otpInput}
                    value={otpCode}
                    onChangeText={(v) => {
                      setOtpCode(v.replace(/[^0-9]/g, ""));
                      setOtpError("");
                    }}
                    keyboardType="number-pad"
                    maxLength={6}
                    placeholder="000000"
                    placeholderTextColor="#ccc"
                  />
                </View>
                {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

                <TouchableOpacity
                  style={styles.verifyOtpButton}
                  onPress={handleVerifyOtp}
                >
                  <Text style={styles.verifyOtpButtonText}>Verify Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.resendButton}
                  onPress={handleResendOtp}
                  disabled={resendTimer > 0}
                >
                  <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonDisabled]}>
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend Code"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Professional Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Information</Text>

            <View style={[styles.inputContainer, touched.department && errors.department && styles.inputError]}>
              <Ionicons name="medical-outline" size={20} color={touched.department && errors.department ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Department/Specialty *"
                value={department}
                onChangeText={(v) => handleChange("department", v, setDepartment)}
                onBlur={() => handleBlur("department", department)}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {touched.department && !errors.department && department && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.department && errors.department && <Text style={styles.errorText}>{errors.department}</Text>}

            <View style={[styles.inputContainer, touched.hospital && errors.hospital && styles.inputError]}>
              <Ionicons name="business-outline" size={20} color={touched.hospital && errors.hospital ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Hospital/Clinic Name *"
                value={hospital}
                onChangeText={(v) => handleChange("hospital", v, setHospital)}
                onBlur={() => handleBlur("hospital", hospital)}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {touched.hospital && !errors.hospital && hospital && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.hospital && errors.hospital && <Text style={styles.errorText}>{errors.hospital}</Text>}

            <View style={[styles.inputContainer, touched.degree && errors.degree && styles.inputError]}>
              <Ionicons name="school-outline" size={20} color={touched.degree && errors.degree ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Degree/Qualification *"
                value={degree}
                onChangeText={(v) => handleChange("degree", v, setDegree)}
                onBlur={() => handleBlur("degree", degree)}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {touched.degree && !errors.degree && degree && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.degree && errors.degree && <Text style={styles.errorText}>{errors.degree}</Text>}

            <View style={[styles.inputContainer, touched.registrationNumber && errors.registrationNumber && styles.inputError]}>
              <Ionicons name="card-outline" size={20} color={touched.registrationNumber && errors.registrationNumber ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="BMDC Registration Number *"
                value={registrationNumber}
                onChangeText={(v) => handleChange("registrationNumber", v, setRegistrationNumber)}
                onBlur={() => handleBlur("registrationNumber", registrationNumber)}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {touched.registrationNumber && !errors.registrationNumber && registrationNumber && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.registrationNumber && errors.registrationNumber && <Text style={styles.errorText}>{errors.registrationNumber}</Text>}

            <View style={[styles.inputContainer, touched.place && errors.place && styles.inputError]}>
              <Ionicons name="location-outline" size={20} color={touched.place && errors.place ? "#dc3545" : "#666"} style={styles.icon} />
              <TextInput
                placeholder="Chamber/Practice Location *"
                value={place}
                onChangeText={(v) => handleChange("place", v, setPlace)}
                onBlur={() => handleBlur("place", place)}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {touched.place && !errors.place && place && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </View>
            {touched.place && errors.place && <Text style={styles.errorText}>{errors.place}</Text>}

            {/* Appointment Time Picker */}
            <TouchableOpacity
              style={[styles.inputContainer, touched.appointmentTime && errors.appointmentTime && styles.inputError]}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={20} color={touched.appointmentTime && errors.appointmentTime ? "#dc3545" : "#666"} style={styles.icon} />
              <Text style={[styles.input, !appointmentTime && styles.pickerText, appointmentTime && { color: "#333" }]}>
                {appointmentTime || "Appointment Time *"}
              </Text>
              {touched.appointmentTime && !errors.appointmentTime && appointmentTime && (
                <Ionicons name="checkmark-circle" size={20} color="#28a745" />
              )}
            </TouchableOpacity>
            {touched.appointmentTime && errors.appointmentTime && <Text style={styles.errorText}>{errors.appointmentTime}</Text>}

            {showTimePicker && (
              <DateTimePicker
                value={selectedTime}
                mode="time"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={onTimeChange}
              />
            )}
          </View>

          {/* Form validation summary */}
          <View style={styles.requiredNote}>
            <Text style={styles.requiredNoteText}>* All fields are required</Text>
          </View>

          {/* Signup button */}
          <TouchableOpacity
            style={[
              styles.signupButton,
              loading && styles.signupButtonDisabled,
              !isFormValid() && styles.signupButtonDisabled
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            <Text style={styles.signupButtonText}>
              {loading ? "Creating Account..." : "Sign Up"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.replace("/screen/login")}
          >
            <Text style={styles.loginLinkText}>
              Already have an account?{" "}
              <Text style={styles.loginLinkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#f8f9fa",
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    paddingLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    paddingHorizontal: 16,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: "#dc3545",
    borderWidth: 1.5,
    backgroundColor: "#fff5f5",
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
  },
  pickerText: {
    color: "#999",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 12,
    marginTop: 2,
  },
  tipText: {
    color: "#fd7e14",
  },
  strengthContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 4,
    paddingHorizontal: 4,
  },
  strengthBarContainer: {
    flexDirection: "row",
    flex: 1,
    marginRight: 10,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 70,
    textAlign: "right",
  },
  requiredNote: {
    alignItems: "center",
    marginBottom: 8,
  },
  requiredNoteText: {
    fontSize: 13,
    color: "#666",
    fontStyle: "italic",
  },
  signupButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  signupButtonDisabled: {
    backgroundColor: "#a0c4ff",
    shadowOpacity: 0.1,
  },
  signupButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  loginLink: {
    alignItems: "center",
    paddingVertical: 12,
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 15,
    color: "#666",
  },
  loginLinkBold: {
    color: "#007AFF",
    fontWeight: "600",
  },
  eyeIcon: {
    padding: 8,
    marginRight: 4,
  },
  verifyButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: "#e8f4ff",
  },
  verifyButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  verifyButtonDisabled: {
    color: "#999",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  verifiedText: {
    color: "#28a745",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  verifyHintText: {
    color: "#fd7e14",
    fontSize: 12,
    marginLeft: 4,
    marginBottom: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    width: "100%",
    maxWidth: 350,
    alignItems: "center",
  },
  modalCloseButton: {
    position: "absolute",
    top: 15,
    right: 15,
    padding: 5,
  },
  modalIcon: {
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
  },
  modalEmail: {
    fontSize: 14,
    fontWeight: "600",
    color: "#007AFF",
    marginBottom: 20,
  },
  otpInputContainer: {
    width: "100%",
    marginBottom: 10,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    padding: 15,
    fontSize: 24,
    textAlign: "center",
    letterSpacing: 10,
    fontWeight: "bold",
    color: "#333",
  },
  otpErrorText: {
    color: "#dc3545",
    fontSize: 13,
    marginBottom: 10,
  },
  verifyOtpButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginTop: 10,
    width: "100%",
  },
  verifyOtpButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  resendButton: {
    marginTop: 15,
    padding: 10,
  },
  resendButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  resendButtonDisabled: {
    color: "#999",
  },
});