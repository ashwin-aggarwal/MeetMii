import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import colors from '../constants/colors';
import { getScanStats, getProfile, getQRCode } from '../services/api';

export default function HomeScreen({ navigation, token, username }) {
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [profileData, statsData] = await Promise.all([
          getProfile(username).catch(() => null),
          getScanStats(username).catch(() => null),
        ]);
        setProfile(profileData);
        setStats(statsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  const displayName = profile?.display_name || username;
  const qrUrl = getQRCode(username);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

      {/* Welcome */}
      <Text style={styles.welcomeLabel}>Welcome back,</Text>
      <Text style={styles.displayName}>{displayName}</Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.scans_this_week ?? '—'}</Text>
          <Text style={styles.statLabel}>Scans this week</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.total_scans ?? '—'}</Text>
          <Text style={styles.statLabel}>Total scans</Text>
        </View>
      </View>

      {/* QR preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Card</Text>
        <View style={styles.qrCard}>
          <Image
            source={{ uri: qrUrl }}
            style={styles.qr}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('My Card')}
          >
            <Text style={styles.primaryButtonText}>Show My Card</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit profile */}
      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() => navigation.navigate('ProfileEditor', { token, username })}
      >
        <Text style={styles.outlineButtonText}>Edit Profile</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 48,
  },
  welcomeLabel: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 4,
  },
  displayName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 28,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textLight,
    fontWeight: '500',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  qr: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  primaryButton: {
    width: '100%',
    height: 46,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  outlineButton: {
    width: '100%',
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
