import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import Card from '../components/Card';
import { getProfile } from '../services/api';

const SOCIAL_LINKS = [
  { key: 'instagram', label: 'Instagram', icon: 'logo-instagram', url: (v) => `https://instagram.com/${v}` },
  { key: 'tiktok',    label: 'TikTok',    icon: 'musical-notes-outline', url: (v) => `https://tiktok.com/@${v}` },
  { key: 'snapchat',  label: 'Snapchat',  icon: 'chatbubble-outline', url: (v) => `https://snapchat.com/add/${v}` },
  { key: 'twitter',   label: 'Twitter',   icon: 'logo-twitter', url: (v) => `https://twitter.com/${v}` },
  { key: 'linkedin',  label: 'LinkedIn',  icon: 'logo-linkedin', url: (v) => `https://linkedin.com/in/${v}` },
  { key: 'email',     label: 'Email',     icon: 'mail-outline', url: (v) => `mailto:${v}` },
  { key: 'website',   label: 'Website',   icon: 'globe-outline', url: (v) => v },
];

export default function ProfileViewScreen({ route, navigation }) {
  const { username } = route.params;
  const { colors } = useThemeContext();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await getProfile(username);
        setProfile(data);
      } catch (_) {
        setError('Profile not found.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {error || 'Profile not found.'}
        </Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.goBack, { color: Colors.primary }]}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const activeLinks = SOCIAL_LINKS.filter(({ key }) => profile[key]);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.backBtn} />
      </View>

      {/* ── Hero ── */}
      <View style={styles.hero}>
        <Text style={[styles.displayName, { color: colors.text }]}>
          {profile.display_name || profile.username}
        </Text>
        <Text style={[styles.username, { color: colors.textSecondary }]}>
          @{profile.username}
        </Text>
        {profile.bio ? (
          <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
        ) : null}
      </View>

      {/* ── Connect section ── */}
      {activeLinks.length > 0 && (
        <>
          <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>CONNECT</Text>
          <Card style={styles.linksCard}>
            {activeLinks.map(({ key, label, icon, url }, index) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.linkRow,
                  index < activeLinks.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => Linking.openURL(url(profile[key]))}
                activeOpacity={0.7}
              >
                <View style={[styles.linkIconWrap, { backgroundColor: colors.cardSecondary }]}>
                  <Ionicons name={icon} size={18} color={Colors.primary} />
                </View>
                <Text style={[styles.linkLabel, { color: colors.text }]}>{label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </Card>
        </>
      )}

      {/* ── Scan logged badge ── */}
      <View style={styles.scanBadge}>
        <Ionicons name="checkmark-circle-outline" size={14} color={colors.textTertiary} />
        <Text style={[styles.scanBadgeText, { color: colors.textTertiary }]}>Scan logged</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  errorText: { fontSize: 16, marginBottom: Spacing.lg, textAlign: 'center' },
  goBack: { fontSize: 16, fontWeight: '600' },

  scroll: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 56,
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { ...Typography.h3 },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  displayName: {
    ...Typography.h1,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  username: {
    ...Typography.body,
    marginBottom: Spacing.sm,
  },
  bio: {
    ...Typography.body,
    textAlign: 'center',
    maxWidth: 280,
  },

  // Section header
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },

  // Links card
  linksCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    gap: 12,
  },
  linkIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkLabel: {
    flex: 1,
    ...Typography.h4,
  },

  // Scan badge
  scanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  scanBadgeText: { fontSize: 12, fontWeight: '500' },
});
