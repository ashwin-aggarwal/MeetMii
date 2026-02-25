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
import colors from '../constants/colors';
import { getProfile, updateProfile } from '../services/api';

export default function ProfileEditorScreen({ route, navigation }) {
  const { token, username } = route.params;

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
  const [success, setSuccess] = useState('');
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
    setSuccess('');
    setSaving(true);
    try {
      await updateProfile(token, form);
      setSuccess('Profile updated!');
    } catch (err) {
      setError(err?.detail || 'Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Edit Profile</Text>

        <Text style={styles.sectionLabel}>ABOUT</Text>
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor={colors.textLight}
          value={form.display_name}
          onChangeText={set('display_name')}
        />
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Bio"
          placeholderTextColor={colors.textLight}
          value={form.bio}
          onChangeText={set('bio')}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Text style={styles.sectionLabel}>SOCIAL LINKS</Text>
        <TextInput
          style={styles.input}
          placeholder="Instagram (@username)"
          placeholderTextColor={colors.textLight}
          value={form.instagram}
          onChangeText={set('instagram')}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Snapchat (@username)"
          placeholderTextColor={colors.textLight}
          value={form.snapchat}
          onChangeText={set('snapchat')}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="TikTok (@username)"
          placeholderTextColor={colors.textLight}
          value={form.tiktok}
          onChangeText={set('tiktok')}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Twitter (@username)"
          placeholderTextColor={colors.textLight}
          value={form.twitter}
          onChangeText={set('twitter')}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="LinkedIn (profile URL or username)"
          placeholderTextColor={colors.textLight}
          value={form.linkedin}
          onChangeText={set('linkedin')}
          autoCapitalize="none"
        />

        <Text style={styles.sectionLabel}>CONTACT</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={colors.textLight}
          value={form.email}
          onChangeText={set('email')}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Website"
          placeholderTextColor={colors.textLight}
          value={form.website}
          onChangeText={set('website')}
          autoCapitalize="none"
          keyboardType="url"
        />

        <Text style={styles.sectionLabel}>SETTINGS</Text>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleLabel}>Professional Mode</Text>
            <Text style={styles.toggleSubtitle}>Only show LinkedIn and email</Text>
          </View>
          <Switch
            value={form.is_professional_mode}
            onValueChange={set('is_professional_mode')}
            trackColor={{ false: '#E0E0E0', true: colors.primary }}
            thumbColor="#fff"
          />
        </View>

        {success ? <Text style={styles.success}>{success}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Save</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 8,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textLight,
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 8,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.secondary,
    marginBottom: 12,
  },
  multiline: {
    height: 90,
    paddingTop: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 24,
  },
  toggleText: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  toggleSubtitle: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 2,
  },
  success: {
    color: colors.success,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  error: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
