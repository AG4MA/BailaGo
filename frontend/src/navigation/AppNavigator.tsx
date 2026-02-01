import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeScreen,
  DanceTypeSelectionScreen,
  EventCalendarScreen,
  CreateEventScreen,
  EventDetailScreen,
  MyEventsScreen,
  ProfileScreen,
} from '../screens';
import {
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  VerifyEmailScreen,
  ResetPasswordScreen,
} from '../screens/auth';
import { colors } from '../theme';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MyEvents') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="MyEvents" 
        component={MyEventsScreen}
        options={{ tabBarLabel: 'I miei eventi' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profilo' }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Loading screen
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          headerShadowVisible: false,
        }}
      >
        {!isAuthenticated ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ForgotPassword" 
              component={ForgotPasswordScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="VerifyEmail" 
              component={VerifyEmailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="ResetPassword" 
              component={ResetPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Main App Stack
          <>
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="DanceTypeSelection" 
              component={DanceTypeSelectionScreen}
              options={{ 
                title: 'Scegli il ballo',
                headerBackTitle: 'Indietro',
              }}
            />
            <Stack.Screen 
              name="EventCalendar" 
              component={EventCalendarScreen}
              options={{ 
                title: 'Calendario',
                headerBackTitle: 'Indietro',
              }}
            />
            <Stack.Screen 
              name="CreateEvent" 
              component={CreateEventScreen}
              options={{ 
                title: 'Crea evento',
                headerBackTitle: 'Annulla',
              }}
            />
            <Stack.Screen 
              name="EventDetail" 
              component={EventDetailScreen}
              options={{ 
                title: '',
                headerTransparent: true,
                headerTintColor: colors.textWhite,
              }}
            />
            <Stack.Screen 
              name="VerifyEmail" 
              component={VerifyEmailScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
