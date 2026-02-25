import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  StyleSheet,
} from 'react-native';
import colors from '../constants/colors';
import { getQRCode } from '../services/api';

export default function MyCardScreen({ username }) {
  const [loading, setLoading] = useState(true);

  const qrUrl = getQRCode(username);
  const profileUrl = `https://meetmii.com/${username}`;

  async function handleShare() {
    try {
      await Share.share({
        message: `Connect with me on MeetMii: ${profileUrl}`,
        url: profileUrl,
      });
    } catch (_) {}
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Card</Text>

      <View style={styles.qrWrapper}>
        {loading && (
          <ActivityIndicator
            style={StyleSheet.absoluteFill}
            size="large"
            color={colors.primary}
          />
        )}
        <Image
          source={{ uri: qrUrl }}
          style={styles.qr}
          onLoadEnd={() => setLoading(false)}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.username}>@{username}</Text>
      <Text style={styles.subtitle}>Scan to connect with me</Text>

      <TouchableOpacity style={styles.button} onPress={handleShare}>
        <Text style={styles.buttonText}>Share Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 32,
  },
  qrWrapper: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  qr: {
    width: 260,
    height: 260,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 36,
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
