import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import colors from '../constants/colors';

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const scanned = useRef(false);

  function handleBarCodeScanned({ data }) {
    if (scanned.current) return;
    scanned.current = true;

    // URL format: https://meetmii.com/{username}
    const username = data.split('/').filter(Boolean).pop();
    navigation.navigate('ProfileView', { username });
  }

  // Reset scanned flag when returning to this screen
  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      scanned.current = false;
    });
    return unsubscribe;
  }, [navigation]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>
          Camera access is needed to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Allow Camera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      />
      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
      </View>
      <View style={styles.hint}>
        <Text style={styles.hintText}>Point camera at a MeetMii QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 220,
    height: 220,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  hint: {
    position: 'absolute',
    bottom: 80,
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 20,
  },
  hintText: {
    color: '#fff',
    fontSize: 14,
  },
  permissionText: {
    color: colors.text,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 40,
    backgroundColor: colors.background,
  },
  permissionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
