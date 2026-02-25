import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import MyCardScreen from '../screens/MyCardScreen';
import ScannerScreen from '../screens/ScannerScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import ProfileEditorScreen from '../screens/ProfileEditorScreen';
import colors from '../constants/colors';

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

function MainTabs({ token, username }) {
  return (
    <MainTab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textLight,
        headerShown: false,
      }}
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
    </MainTab.Navigator>
  );
}

function MainNavigator({ token, username }) {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="MainTabs">
        {(props) => <MainTabs {...props} token={token} username={username} />}
      </MainStack.Screen>
      <MainStack.Screen name="ProfileEditor" component={ProfileEditorScreen} />
    </MainStack.Navigator>
  );
}

export default function AppNavigator() {
  const [auth, setAuth] = useState({ token: null, username: null });

  function handleLogin(token, username) {
    setAuth({ token, username });
  }

  return (
    <NavigationContainer>
      {auth.token ? (
        <MainNavigator token={auth.token} username={auth.username} />
      ) : (
        <AuthNavigator onLogin={handleLogin} />
      )}
    </NavigationContainer>
  );
}
