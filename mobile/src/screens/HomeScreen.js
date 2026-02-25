import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { getScanStats, getProfile, getQRCode } from '../services/api';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function SkeletonBox({ width, height, style, colors }) {
  return (
    <View
      style={[
        { width, height, borderRadius: 12, backgroundColor: colors.cardSecondary },
        style,
      ]}
    />
  );
}

export default function HomeScreen({ navigation, token, username }) {
  const { colors, isDark } = useThemeContext();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      async function load() {
        const [profileData, statsData] = await Promise.all([
          getProfile(username).catch(() => null),
          getScanStats(username).catch(() => null),
        ]);
        setProfile(profileData);
        setStats(statsData);
        setLoading(false);
      }
      load();
    }, [username])
  );

  const displayName = profile?.display_name || username;
  const qrUrl = getQRCode(username);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.greeting, { color: colors.textSecondary }]}>
            {greeting()} 👋
          </Text>
          {loading ? (
            <SkeletonBox width={180} height={36} style={{ marginTop: 4 }} colors={colors} />
          ) : (
            <Text style={[styles.displayName, { color: colors.text }]}>{displayName}</Text>
          )}
        </View>
        <TouchableOpacity
          style={[styles.settingsBtn, { backgroundColor: colors.cardSecondary }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* ── Hero banner ── */}
      {loading ? (
        <SkeletonBox width="100%" height={140} style={{ borderRadius: 20, marginBottom: Spacing.lg }} colors={colors} />
      ) : (
        <LinearGradient
          colors={['#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerLabel}>Your card has been scanned</Text>
          <Text style={styles.bannerNumber}>{stats?.scans_this_week ?? 0}</Text>
          <Text style={styles.bannerSub}>times this week</Text>
        </LinearGradient>
      )}

      {/* ── Quick stats ── */}
      <View style={styles.statsRow}>
        {loading ? (
          <>
            <SkeletonBox width="47%" height={90} style={{ borderRadius: 20 }} colors={colors} />
            <SkeletonBox width="47%" height={90} style={{ borderRadius: 20 }} colors={colors} />
          </>
        ) : (
          <>
            <Card style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {stats?.total_scans ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total scans</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {stats?.scans_this_month ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This month</Text>
            </Card>
          </>
        )}
      </View>

      {/* ── QR Code ── */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Card</Text>
      {loading ? (
        <SkeletonBox width="100%" height={230} style={{ borderRadius: 20, marginBottom: Spacing.lg }} colors={colors} />
      ) : (
        <Card style={styles.qrCard}>
          <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
          <GradientButton
            title="Show My Card"
            onPress={() => navigation.navigate('My Card')}
            style={styles.qrButton}
          />
        </Card>
      )}

      {/* ── Edit profile ── */}
      {!loading && (
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => navigation.navigate('ProfileEditor', { token, username })}
        >
          <Card style={styles.editRow}>
            <View style={styles.editLeft}>
              <View style={[styles.editIconWrap, { backgroundColor: colors.cardSecondary }]}>
                <Ionicons name="person-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={[styles.editLabel, { color: colors.text }]}>Complete your profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </Card>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerText: { flex: 1, marginRight: Spacing.md },
  greeting: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  displayName: { ...Typography.h1 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Banner
  banner: {
    borderRadius: 20,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bannerLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500', marginBottom: 4 },
  bannerNumber: { color: '#fff', fontSize: 52, fontWeight: '800', letterSpacing: -1, lineHeight: 58 },
  bannerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 2 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
  },
  statNumber: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2, textAlign: 'center' },

  // QR
  sectionTitle: { ...Typography.h3, marginBottom: Spacing.sm },
  qrCard: { alignItems: 'center', marginBottom: Spacing.md, padding: Spacing.lg },
  qrImage: { width: 150, height: 150, marginBottom: Spacing.lg },
  qrButton: { width: '100%' },

  // Edit row
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  editLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  editIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  editLabel: { ...Typography.h4 },
});
