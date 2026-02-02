import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, EventsProvider, GroupsProvider } from './src/contexts';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <GroupsProvider>
          <EventsProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </EventsProvider>
        </GroupsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
