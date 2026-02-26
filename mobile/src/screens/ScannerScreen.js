import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '../context/ThemeContext';
import { Colors } from '../constants/colors';
import { Typography } from '../constants/typography';
import { Spacing } from '../constants/spacing';
import Card from '../components/Card';
import GradientButton from '../components/GradientButton';

const FRAME_SIZE = 220;
const OVERLAY = 'rgba(0,0,0,0.62)';

export default function ScannerScreen({ navigation }) {
  const { colors } = useThemeContext();
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const scanned = useRef(false);

  function handleBarCodeScanned({ data }) {
    if (scanned.current) return;
    scanned.current = true;
    const username = data.split('/').filter(Boolean).pop();
    navigation.navigate('ProfileView', { username });
  }

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      scanned.current = false;
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return <View style={[styles.container, { backgroundColor: colors.background }]} />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.permissionContainer, { backgroundColor: colors.background }]}>
        <Card style={styles.permissionCard}>
          <View style={[styles.permissionIconWrap, { backgroundColor: colors.cardSecondary }]}>
            <Ionicons name="camera-outline" size={32} color={Colors.primary} />
          </View>
          <Text style={[styles.permissionTitle, { color: colors.text }]}>
            Camera Access Required
          </Text>
          <Text style={[styles.permissionBody, { color: colors.textSecondary }]}>
            MeetMii needs camera access to scan QR codes. Please allow camera access to continue.
          </Text>
          <GradientButton
            title="Allow Camera"
            onPress={requestPermission}
            style={styles.permissionBtn}
          />
          <TouchableOpacity onPress={() => Linking.openSettings()} style={styles.settingsLink}>
            <Text style={[styles.settingsLinkText, { color: Colors.primary }]}>Open Settings</Text>
          </TouchableOpacity>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      {/* Camera */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />

      {/* Torch button */}
      <TouchableOpacity style={styles.torchBtn} onPress={() => setTorchOn((v) => !v)}>
        <Ionicons
          name={torchOn ? 'flash' : 'flash-outline'}
          size={22}
          color={torchOn ? '#FACC15' : '#fff'}
        />
      </TouchableOpacity>

      {/* Overlay with transparent hole */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top shade */}
        <View style={[styles.shade, { flex: 1 }]} />
        {/* Middle row */}
        <View style={{ flexDirection: 'row', height: FRAME_SIZE }}>
          <View style={[styles.shade, { flex: 1 }]} />
          {/* Transparent scan zone with corner accents */}
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
          <View style={[styles.shade, { flex: 1 }]} />
        </View>
        {/* Bottom shade */}
        <View style={[styles.shade, { flex: 1 }]} />
      </View>

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>Point at a MeetMii QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },

  // Permission state
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  permissionCard: {
    width: '100%',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  permissionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  permissionTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  permissionBody: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  permissionBtn: { width: '100%', marginBottom: Spacing.md },
  settingsLink: { paddingVertical: Spacing.sm },
  settingsLinkText: { fontSize: 15, fontWeight: '600' },

  // Torch
  torchBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Overlay
  shade: { backgroundColor: OVERLAY },

  // Scan frame
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#7C3AED',
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 4 },

  // Hint
  hintContainer: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  hintText: { color: '#fff', fontSize: 14, fontWeight: '500' },
});
