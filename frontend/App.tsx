import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, EventsProvider } from './src/contexts';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <AuthProvider>
      <EventsProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </EventsProvider>
    </AuthProvider>
  );
}
