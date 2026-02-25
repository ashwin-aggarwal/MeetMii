import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StyleSheet,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useFocusEffect } from '@react-navigation/native';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';
import { getQRCode, getProfile } from '../services/api';

export default function MyCardScreen({ username }) {
  const { colors, isDark } = useThemeContext();
  const [displayName, setDisplayName] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const qrUrl = getQRCode(username);
  const profileUrl = `https://meetmii.com/${username}`;

  useFocusEffect(
    useCallback(() => {
      getProfile(username)
        .then((p) => setDisplayName(p.display_name || username))
        .catch(() => setDisplayName(username));
    }, [username])
  );

  async function handleShare() {
    try {
      await Share.share({
        message: `Connect with me on MeetMii: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (_) {}
  }

  async function handleCopy() {
    await Clipboard.setStringAsync(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Card</Text>
      </View>

      {/* ── Content ── */}
      <View style={styles.content}>
        {/* Card with purple glow */}
        <Card
          style={[
            styles.card,
            {
              backgroundColor: isDark ? '#0D0D1A' : colors.card,
              shadowColor: '#7C3AED',
              shadowOpacity: isDark ? 0.4 : 0.18,
              shadowRadius: 28,
              elevation: 10,
            },
          ]}
        >
          {/* Identity */}
          <Text style={[styles.displayName, { color: colors.text }]} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{username}</Text>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* QR Code */}
          <View style={styles.qrWrapper}>
            {qrLoading && (
              <ActivityIndicator
                style={StyleSheet.absoluteFill}
                size="large"
                color={Colors.primary}
              />
            )}
            <Image
              source={{ uri: qrUrl }}
              style={styles.qrImage}
              resizeMode="contain"
              onLoadEnd={() => setQrLoading(false)}
            />
          </View>

          {/* Caption */}
          <Text style={[styles.caption, { color: colors.textTertiary }]}>
            Scan to connect with me
          </Text>
        </Card>

        {/* ── Action buttons ── */}
        <View style={styles.actions}>
          <GradientButton title="Share" onPress={handleShare} style={styles.shareBtn} />
          <TouchableOpacity
            style={[styles.copyBtn, { borderColor: Colors.primary }]}
            onPress={handleCopy}
            activeOpacity={0.75}
          >
            <Text style={[styles.copyText, { color: Colors.primary }]}>
              {copied ? '✓ Copied' : 'Copy Link'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingTop: 60,
    paddingBottom: Spacing.md,
    alignItems: 'center',
  },
  headerTitle: {
    ...Typography.h2,
  },

  // Content
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Card internals
  card: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  displayName: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  username: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  divider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  qrWrapper: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  caption: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },

  // Actions
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: Spacing.lg,
    width: '100%',
  },
  shareBtn: {
    flex: 1,
  },
  copyBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyText: {
    ...Typography.button,
  },
});
