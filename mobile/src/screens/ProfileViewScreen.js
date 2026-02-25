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
import colors from '../constants/colors';
import { getProfile } from '../services/api';

const SOCIAL_LINKS = [
  {
    key: 'instagram',
    label: 'Instagram',
    url: (v) => `https://instagram.com/${v}`,
  },
  {
    key: 'snapchat',
    label: 'Snapchat',
    url: (v) => `https://snapchat.com/add/${v}`,
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    url: (v) => `https://tiktok.com/@${v}`,
  },
  {
    key: 'twitter',
    label: 'Twitter',
    url: (v) => `https://twitter.com/${v}`,
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    url: (v) => `https://linkedin.com/in/${v}`,
  },
  {
    key: 'email',
    label: 'Email',
    url: (v) => `mailto:${v}`,
  },
  {
    key: 'website',
    label: 'Website',
    url: (v) => v,
  },
];

export default function ProfileViewScreen({ route, navigation }) {
  const { username } = route.params;
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Profile not found.'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.displayName}>{profile.display_name || profile.username}</Text>
        <Text style={styles.username}>@{profile.username}</Text>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
      </View>

      <View style={styles.linksSection}>
        {SOCIAL_LINKS.map(({ key, label, url }) =>
          profile[key] ? (
            <TouchableOpacity
              key={key}
              style={styles.linkButton}
              onPress={() => Linking.openURL(url(profile[key]))}
            >
              <Text style={styles.linkText}>{label}</Text>
              <Text style={styles.linkValue}>{profile[key]}</Text>
            </TouchableOpacity>
          ) : null
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  displayName: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  username: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 22,
  },
  linksSection: {
    gap: 12,
  },
  linkButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  linkValue: {
    fontSize: 14,
    color: colors.primary,
    maxWidth: '60%',
    textAlign: 'right',
  },
  error: {
    color: colors.error,
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
});
