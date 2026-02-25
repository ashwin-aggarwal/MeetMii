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
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { getProfile, updateProfile } from '../services/api';

function SectionHeader({ label, colors }) {
  return (
    <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>{label}</Text>
  );
}

function SettingsRow({ icon, label, right, onPress, colors, noBorder }) {
  return (
    <TouchableOpacity
      style={[
        styles.row,
        { backgroundColor: colors.card, borderBottomColor: colors.border },
        noBorder && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.6 : 1}
    >
      <Text style={styles.rowIcon}>{icon}</Text>
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>{right}</View>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ token, username, onLogout }) {
  const { colors, isDark, mode, toggleTheme } = useThemeContext();
  const [profile, setProfile] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [savingPro, setSavingPro] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    getProfile(username)
      .then((p) => {
        setProfile(p);
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

  const modeLabel = mode === 'system' ? 'System' : isDark ? 'Dark' : 'Light';

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* ACCOUNT */}
        <SectionHeader label="ACCOUNT" colors={colors} />
        <View style={[styles.section, { borderColor: colors.border }]}>
          {editingName ? (
            <View style={[styles.row, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={styles.rowIcon}>✏️</Text>
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
            <SettingsRow
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
          <SettingsRow
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
            noBorder
          />
        </View>

        {/* APPEARANCE */}
        <SectionHeader label="APPEARANCE" colors={colors} />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingsRow
            icon={isDark ? '🌙' : '☀️'}
            label="Dark Mode"
            right={
              <View style={styles.toggleWithLabel}>
                <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{modeLabel}</Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            }
            colors={colors}
            noBorder
          />
        </View>

        {/* SHARING */}
        <SectionHeader label="SHARING" colors={colors} />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingsRow
            icon="🔗"
            label="Copy Profile Link"
            right={<Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>}
            onPress={copyLink}
            colors={colors}
          />
          <SettingsRow
            icon="📤"
            label="Share QR Code"
            right={<Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>}
            onPress={shareQR}
            colors={colors}
            noBorder
          />
        </View>

        {/* ABOUT */}
        <SectionHeader label="ABOUT" colors={colors} />
        <View style={[styles.section, { borderColor: colors.border }]}>
          <SettingsRow
            icon="ℹ️"
            label="App Version"
            right={<Text style={[styles.rowValue, { color: colors.textSecondary }]}>1.0.0</Text>}
            colors={colors}
            noBorder
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.card }]}
          onPress={handleLogout}
        >
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
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 20,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    paddingHorizontal: 24,
    paddingBottom: 6,
    marginTop: 8,
  },
  section: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: { fontSize: 18, marginRight: 12, width: 28 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowRight: { alignItems: 'flex-end' },
  rowValue: { fontSize: 14 },
  arrow: { fontSize: 22, fontWeight: '400' },
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
  logoutButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 48,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EF4444' },
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
