// app/index.js or app/start.js
import { theme } from '@/constants/theme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export default function StartScreen() {
  const router = useRouter();
  const [roleSelected, setRoleSelected] = useState<string | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 768; // side-by-side on tablets/desktop widths

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
      // Keep API consistent; no zoom when using gradient
      Animated.timing(scale, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fade, scale]);

  return (
    <View style={styles.container}>
      {/* Gradient background */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]}> 
        <LinearGradient
          colors={["#93C5FD", "#A7F3D0", "#5EEAD4"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* 7-section grid overlay; brand in sections 5 and 6 */}
      <View pointerEvents="none" style={styles.grid7}>
        <View style={styles.sectionRow} />
        <View style={styles.sectionRow} />
        <View style={styles.sectionRow} />
        <View style={styles.sectionRow} />
        <View style={styles.sectionRow}>
          <Text style={styles.brandCenterTitle}>Connect <Text style={styles.brandAccent}>Care</Text></Text>
        </View>
        <View style={styles.sectionRow}>
          <Text style={styles.brandCenterTagline}>Your gateway to health appointments and professional management.</Text>
        </View>
        <View style={styles.sectionRow} />
      </View>

      {/* Bottom action card */}
      <View style={styles.content}>
        <BlurView intensity={40} tint="light" style={styles.cardBlurWrapper}>
          <View style={styles.cardInner}>
            <Text style={styles.sectionHeader}>How would you like to proceed?</Text>

            <View style={[styles.rolesRow, isWide ? styles.rolesRowWide : undefined]}>
              {/* Patient Role Card */}
              <TouchableOpacity
                onPress={() => {
                  setRoleSelected('Patient');
                  setTimeout(() => {
                    router.push('/Home/(tabs)/home');
                    setRoleSelected(null);
                  }, 500);
                }}
                style={[styles.roleCard, styles.rolePrimary]}
                activeOpacity={0.9}
              >
                <View style={styles.roleHeader}>
                  <Feather name="search" size={24} color="#2563EB" />
                  <Text style={[styles.roleTitle, styles.rolePrimaryTitle]}>I am a Patient</Text>
                </View>
                <Text style={styles.roleDesc}>
                  Find and book a doctor based on specialty, location, and rating in real-time.
                </Text>
              </TouchableOpacity>

              {/* Doctor Role Card */}
              <TouchableOpacity
                onPress={() => {
                  setRoleSelected('Doctor');
                  setTimeout(() => {
                    router.push('/screen/login');
                    setRoleSelected(null);
                  }, 500);
                }}
                style={[styles.roleCard, styles.roleSecondary]}
                activeOpacity={0.9}
              >
                <View style={styles.roleHeader}>
                  <MaterialCommunityIcons name="doctor" size={26} color="#111827" />
                  <Text style={[styles.roleTitle, styles.roleSecondaryTitle]}>I am a Doctor</Text>
                </View>
                <Text style={styles.roleDesc}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: '#000',
  },
  overlay: {},
  content: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  headerTop: {},
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  brandAccent: {
    color: theme.colors.secondary,
  },
  brandTagline: {
    marginTop: 6,
    fontSize: 13,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  grid7: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'column',
  },
  sectionRow: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandCenterTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  brandCenterTagline: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  cardBlurWrapper: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    ...theme.shadow,
  },
  cardInner: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: theme.spacing.lg,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  rolesRow: {
    width: '100%',
  },
  rolesRowWide: {
    flexDirection: 'row',
    columnGap: theme.spacing.md,
  },
  roleCard: {
    width: '100%',
    borderRadius: theme.radius.md,
    borderWidth: 2,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    backgroundColor: '#ffffff',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  roleIcon: {
    fontSize: 22,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: theme.spacing.sm,
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4b5563',
  },
  rolePrimary: {
    borderColor: '#3b82f6',
  },
  roleSecondary: {
    borderColor: '#e5e7eb',
  },
  rolePrimaryIcon: {
    color: '#2563EB',
  },
  roleSecondaryIcon: {
    color: '#111827',
  },
  rolePrimaryTitle: {
    color: '#1e3a8a',
  },
  roleSecondaryTitle: {
    color: '#111827',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: theme.spacing.xs,
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: theme.spacing.xl,
    color: '#E5E7EB',
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.sm,
    width: '100%',
    alignItems: 'center',
    ...theme.shadow,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.md,
    marginTop: theme.spacing.xs,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  buttonOutlineText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  processingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  processingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  processingText: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
  },
});
