import React, { useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MyCardScreen from '../screens/MyCardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ProfileEditorScreen from '../screens/ProfileEditorScreen';
import ProfileViewScreen from '../screens/ProfileViewScreen';
import { Colors } from '../constants/colors';
import { useThemeContext } from '../context/ThemeContext';

const AuthStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const MainTab = createBottomTabNavigator();

function AuthNavigator({ onLogin }) {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
        {(props) => <RegisterScreen {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
    </AuthStack.Navigator>
  );
}

function MainTabs({ token, username, onLogout }) {
  const { colors, isDark } = useThemeContext();
  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'home',
            'My Card': 'qr-code',
            Scanner: 'scan',
            Analytics: 'bar-chart',
            Settings: 'settings',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <MainTab.Screen
        name="Home"
        children={(props) => <HomeScreen {...props} token={token} username={username} />}
      />
      <MainTab.Screen
        name="My Card"
        children={(props) => <MyCardScreen {...props} token={token} username={username} />}
      />
      <MainTab.Screen
        name="Scanner"
        children={(props) => <ScannerScreen {...props} token={token} username={username} />}
      />
      <MainTab.Screen
        name="Analytics"
        children={(props) => <AnalyticsScreen {...props} token={token} username={username} />}
      />
      <MainTab.Screen
        name="Settings"
        children={(props) => (
          <SettingsScreen {...props} token={token} username={username} onLogout={onLogout} />
        )}
      />
    </MainTab.Navigator>
  );
}

function MainNavigator({ token, username, onLogout }) {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs">
        {(props) => <MainTabs {...props} token={token} username={username} onLogout={onLogout} />}
      </MainStack.Screen>
      <MainStack.Screen name="ProfileEditor" component={ProfileEditorScreen} />
      <MainStack.Screen name="ProfileView" component={ProfileViewScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const [auth, setAuth] = useState({ token: null, username: null });
  const { colors, isDark } = useThemeContext();

  function handleLogin(token, username) {
    setAuth({ token, username });
  }

  function handleLogout() {
    setAuth({ token: null, username: null });
  }

  const navTheme = isDark ? {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: '#7C3AED',
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  } : {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: '#7C3AED',
      background: colors.background,
      card: colors.card,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      {auth.token ? (
        <MainNavigator token={auth.token} username={auth.username} onLogout={handleLogout} />
      ) : (
        <AuthNavigator onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}
