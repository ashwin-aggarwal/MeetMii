import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import GradientButton from '../components/GradientButton';
import { getProfile, updateProfile } from '../services/api';

const SOCIAL_FIELDS = [
  { key: 'instagram', label: 'Instagram', hasAt: true },
  { key: 'tiktok',    label: 'TikTok',    hasAt: true },
  { key: 'snapchat',  label: 'Snapchat',  hasAt: true },
  { key: 'twitter',   label: 'Twitter',   hasAt: true },
  { key: 'linkedin',  label: 'LinkedIn',  hasAt: false },
];

export default function ProfileEditorScreen({ route, navigation }) {
  const { token, username } = route.params;
  const { colors } = useThemeContext();

  const [form, setForm] = useState({
    display_name: '',
    bio: '',
    instagram: '',
    snapchat: '',
    tiktok: '',
    twitter: '',
    linkedin: '',
    email: '',
    website: '',
    is_professional_mode: false,
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const profile = await getProfile(username);
        setForm({
          display_name: profile.display_name || '',
          bio: profile.bio || '',
          instagram: profile.instagram || '',
          snapchat: profile.snapchat || '',
          tiktok: profile.tiktok || '',
          twitter: profile.twitter || '',
          linkedin: profile.linkedin || '',
          email: profile.email || '',
          website: profile.website || '',
          is_professional_mode: profile.is_professional_mode || false,
        });
      } catch (_) {
        // No profile yet — start with empty form
      } finally {
        setLoadingProfile(false);
      }
    }
    loadProfile();
  }, []);

  function set(field) {
    return (value) => setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setError('');
    setSaving(true);
    try {
      await updateProfile(token, form);
      setToast('Profile saved!');
      setTimeout(() => setToast(''), 2000);
    } catch (err) {
      setError(err?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ── Header ── */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerBack, { color: colors.textSecondary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity style={styles.headerSide} onPress={handleSave} disabled={saving}>
          <Text style={[styles.headerSave, { color: Colors.primary }]}>
            {saving ? '…' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── IDENTITY ── */}
        <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>IDENTITY</Text>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Display Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Your name"
          placeholderTextColor={colors.textTertiary}
          value={form.display_name}
          onChangeText={set('display_name')}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Bio</Text>
        <TextInput
          style={[styles.input, styles.multiline, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Tell people about yourself"
          placeholderTextColor={colors.textTertiary}
          value={form.bio}
          onChangeText={set('bio')}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        {/* ── SOCIAL LINKS ── */}
        <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>SOCIAL LINKS</Text>
        <View style={[styles.socialCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SOCIAL_FIELDS.map(({ key, label, hasAt }, index) => (
            <View
              key={key}
              style={[
                styles.socialRow,
                index < SOCIAL_FIELDS.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.socialLabel, { color: Colors.primary }]}>{label}</Text>
              {hasAt && (
                <Text style={[styles.atSign, { color: colors.textTertiary }]}>@</Text>
              )}
              <TextInput
                style={[styles.socialInput, { color: colors.text }]}
                placeholder="username"
                placeholderTextColor={colors.textTertiary}
                value={form[key]}
                onChangeText={set(key)}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
        </View>

        {/* ── CONTACT ── */}
        <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>CONTACT</Text>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="email@example.com"
          placeholderTextColor={colors.textTertiary}
          value={form.email}
          onChangeText={set('email')}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Website</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="https://yourwebsite.com"
          placeholderTextColor={colors.textTertiary}
          value={form.website}
          onChangeText={set('website')}
          autoCapitalize="none"
          keyboardType="url"
        />

        {/* ── SETTINGS ── */}
        <Text style={[styles.sectionHeader, { color: colors.textTertiary }]}>SETTINGS</Text>
        <View style={[styles.toggleRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.toggleText}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Professional Mode</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.textSecondary }]}>
              Only show LinkedIn and email to viewers
            </Text>
          </View>
          <Switch
            value={form.is_professional_mode}
            onValueChange={set('is_professional_mode')}
            trackColor={{ false: colors.border, true: Colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {error ? (
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        ) : null}

        <GradientButton
          title="Save Profile"
          onPress={handleSave}
          loading={saving}
          style={styles.saveButton}
        />
      </ScrollView>

      {/* ── Toast ── */}
      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerSide: {
    width: 64,
  },
  headerBack: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    ...Typography.h2,
    flex: 1,
    textAlign: 'center',
  },
  headerSave: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },

  // Scroll content
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // Section headers
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  // Standard inputs
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    height: 50,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  multiline: {
    height: 88,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },

  // Social links card
  socialCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 52,
  },
  socialLabel: {
    width: 82,
    fontSize: 13,
    fontWeight: '700',
  },
  atSign: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 2,
  },
  socialInput: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },

  // Professional mode toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
  },
  toggleText: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  toggleSubtitle: {
    fontSize: 12,
    marginTop: 3,
  },

  // Error
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },

  // Bottom save button
  saveButton: {
    marginTop: Spacing.sm,
  },

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
