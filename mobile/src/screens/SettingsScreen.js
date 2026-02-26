import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Share,
  StyleSheet,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import { getProfile, updateProfile } from '../services/api';

function SectionLabel({ label, colors }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>{label}</Text>
  );
}

function SettingRow({ icon, label, right, onPress, colors, isLast }) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <View style={[styles.rowIconWrap, { backgroundColor: colors.cardSecondary }]}>
        <Text style={styles.rowIcon}>{icon}</Text>
      </View>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ token, username, onLogout }) {
  const { colors, isDark, toggleTheme } = useThemeContext();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [savingPro, setSavingPro] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getProfile(username)
      .then((p) => {
        setDisplayName(p.display_name || '');
        setProMode(p.is_professional_mode || false);
      })
      .catch(() => {});
  }, [username]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  async function saveDisplayName() {
    setSavingName(true);
    try {
      await updateProfile(token, { display_name: displayName });
      setEditingName(false);
      showToast('Display name updated!');
    } catch {
      showToast('Failed to save.');
    } finally {
      setSavingName(false);
    }
  }

  async function toggleProMode(val) {
    setProMode(val);
    setSavingPro(true);
    try {
      await updateProfile(token, { is_professional_mode: val });
      showToast(val ? 'Professional mode on' : 'Professional mode off');
    } catch {
      setProMode(!val);
    } finally {
      setSavingPro(false);
    }
  }

  async function copyLink() {
    await Clipboard.setStringAsync(`https://meetmii.com/${username}`);
    showToast('Link copied!');
  }

  async function shareQR() {
    const qrUrl = `https://qr-service-661768391098.us-central1.run.app/qr/${username}`;
    await Share.share({
      message: `Scan my MeetMii QR code: ${qrUrl}`,
      url: qrUrl,
    });
  }

  function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: onLogout },
    ]);
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* ── ACCOUNT ── */}
        <SectionLabel label="ACCOUNT" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editingName ? (
            <View
              style={[
                styles.row,
                { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={[styles.rowIconWrap, { backgroundColor: colors.cardSecondary }]}>
                <Text style={styles.rowIcon}>✏️</Text>
              </View>
              <TextInput
                style={[styles.nameInput, { color: colors.text, borderColor: colors.border }]}
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveDisplayName}
              />
              <TouchableOpacity onPress={saveDisplayName} disabled={savingName}>
                <Text style={[styles.saveText, { color: Colors.primary }]}>
                  {savingName ? '…' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <SettingRow
              icon="✏️"
              label="Display Name"
              right={
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {displayName || 'Not set'}
                </Text>
              }
              onPress={() => setEditingName(true)}
              colors={colors}
            />
          )}
          <SettingRow
            icon="💼"
            label="Professional Mode"
            right={
              <Switch
                value={proMode}
                onValueChange={toggleProMode}
                disabled={savingPro}
                trackColor={{ false: colors.border, true: Colors.primary }}
                thumbColor="#fff"
              />
            }
            colors={colors}
            isLast
          />
        </View>

        {/* ── APPEARANCE ── */}
        <SectionLabel label="APPEARANCE" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon={isDark ? '🌙' : '☀️'}
            label="Dark Mode"
            right={
              <View style={styles.toggleWithLabel}>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>
                  {isDark ? 'Dark' : 'Light'}
                </Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            }
            colors={colors}
            isLast
          />
        </View>

        {/* ── SHARING ── */}
        <SectionLabel label="SHARING" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="🔗"
            label="Copy Profile Link"
            right={<Ionicons name="copy-outline" size={18} color={colors.textTertiary} />}
            onPress={copyLink}
            colors={colors}
          />
          <SettingRow
            icon="📤"
            label="Share QR Code"
            right={<Ionicons name="share-outline" size={18} color={colors.textTertiary} />}
            onPress={shareQR}
            colors={colors}
            isLast
          />
        </View>

        {/* ── ABOUT ── */}
        <SectionLabel label="ABOUT" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow
            icon="ℹ️"
            label="App Version"
            right={
              <Text style={[styles.rowValue, { color: colors.textSecondary }]}>1.0.0</Text>
            }
            colors={colors}
            isLast
          />
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  title: {
    ...Typography.h2,
    paddingHorizontal: Spacing.lg,
    paddingTop: 64,
    paddingBottom: Spacing.lg,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 6,
    marginTop: Spacing.xs,
  },

  // Section card
  card: {
    marginHorizontal: Spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  rowIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowIcon: { fontSize: 16 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowRight: { alignItems: 'flex-end' },
  rowValue: { fontSize: 14 },
  toggleWithLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nameInput: {
    flex: 1,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 10,
  },
  saveText: { fontSize: 15, fontWeight: '700' },

  // Logout
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: 48,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
