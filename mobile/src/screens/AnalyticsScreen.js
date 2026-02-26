import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import Card from '../components/Card';
import { getScanStats } from '../services/api';

function SkeletonBox({ width, height, style, colors }) {
  return (
    <View
      style={[
        { width, height, borderRadius: 16, backgroundColor: colors.cardSecondary },
        style,
      ]}
    />
  );
}

export default function AnalyticsScreen({ username }) {
  const { colors } = useThemeContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getScanStats(username);
      setStats(data);
    } catch (_) {
      setError('Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [fetchStats])
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Analytics</Text>
        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.cardSecondary }]}
          onPress={fetchStats}
          disabled={loading}
        >
          <Ionicons
            name="refresh"
            size={18}
            color={loading ? colors.textTertiary : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* ── Total scans banner ── */}
      {loading ? (
        <SkeletonBox
          width="100%"
          height={140}
          style={{ borderRadius: 20, marginBottom: Spacing.lg }}
          colors={colors}
        />
      ) : (
        <LinearGradient
          colors={['#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.banner}
        >
          <Text style={styles.bannerLabel}>Total Scans</Text>
          <Text style={styles.bannerNumber}>{stats?.total_scans ?? 0}</Text>
          <Text style={styles.bannerSub}>all time</Text>
        </LinearGradient>
      )}

      {/* ── This Week / This Month ── */}
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
                {stats?.scans_this_week ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Week</Text>
            </Card>
            <Card style={styles.statCard}>
              <Text style={[styles.statNumber, { color: Colors.primary }]}>
                {stats?.scans_this_month ?? 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
            </Card>
          </>
        )}
      </View>

      {/* ── Scan History info card ── */}
      {!loading && (
        <Card style={styles.historyCard}>
          <View style={styles.historyRow}>
            <View style={[styles.historyIcon, { backgroundColor: colors.cardSecondary }]}>
              <Ionicons name="bar-chart-outline" size={20} color={Colors.primary} />
            </View>
            <View style={styles.historyText}>
              <Text style={[styles.historyTitle, { color: colors.text }]}>Scan History</Text>
              <Text style={[styles.historySub, { color: colors.textSecondary }]}>
                Every scan is logged in real time
              </Text>
            </View>
          </View>
        </Card>
      )}

      {error ? (
        <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
      ) : null}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  headerTitle: { ...Typography.h2 },
  refreshBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Stats row
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

  // History card
  historyCard: { marginBottom: Spacing.md },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyText: { flex: 1 },
  historyTitle: { ...Typography.h4 },
  historySub: { fontSize: 13, marginTop: 2 },

  errorText: { fontSize: 14, textAlign: 'center', marginTop: Spacing.md },
});
