import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../constants/colors';

export default function HomeScreen({ navigation, token, username }) {
  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, @{username}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ProfileEditor', { token, username })}
      >
        <Text style={styles.buttonText}>Edit Profile</Text>
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
  welcome: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 32,
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
