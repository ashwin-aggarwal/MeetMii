import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../constants/colors';
import { getScanStats } from '../services/api';

function StatCard({ value, label }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardNumber}>{value}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
    </View>
  );
}

export default function AnalyticsScreen({ username }) {
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
      setError('Failed to load analytics. Please try again.');
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
    <View style={styles.container}>
      <Text style={styles.title}>Your Analytics</Text>
      <Text style={styles.subtitle}>@{username}</Text>

      {loading && <ActivityIndicator size="large" color={colors.primary} style={styles.spinner} />}

      {!loading && error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}

      {!loading && stats ? (
        <View style={styles.grid}>
          <StatCard value={stats.total_scans} label="Total Scans" />
          <StatCard value={stats.scans_this_week} label="This Week" />
          <StatCard value={stats.scans_this_month} label="This Month" />
        </View>
      ) : null}

      <TouchableOpacity style={styles.refreshButton} onPress={fetchStats} disabled={loading}>
        <Text style={styles.refreshText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textLight,
    marginBottom: 40,
  },
  spinner: {
    marginTop: 40,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  grid: {
    width: '100%',
    gap: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  cardNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '500',
  },
  refreshButton: {
    marginTop: 32,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  refreshText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
