import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ExpoLocation from 'expo-location';
import { RootStackParamList, Location } from '../types';
import { Button } from '../components';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

type LocationPickerNavigationProp = NativeStackNavigationProp<RootStackParamList, 'LocationPicker'>;
type LocationPickerRouteProp = RouteProp<RootStackParamList, 'LocationPicker'>;

interface LocationPickerScreenProps {
  navigation: LocationPickerNavigationProp;
  route: LocationPickerRouteProp;
}

// Placeholder locations for demo (will be replaced by Google Places API)
const PLACEHOLDER_LOCATIONS = [
  { id: '1', name: 'Piazza Duomo', address: 'Piazza del Duomo', city: 'Milano', latitude: 45.4642, longitude: 9.1900 },
  { id: '2', name: 'Navigli', address: 'Alzaia Naviglio Grande', city: 'Milano', latitude: 45.4507, longitude: 9.1784 },
  { id: '3', name: 'Parco Sempione', address: 'Piazza Sempione', city: 'Milano', latitude: 45.4752, longitude: 9.1754 },
  { id: '4', name: 'Colosseo', address: 'Piazza del Colosseo', city: 'Roma', latitude: 41.8902, longitude: 12.4922 },
  { id: '5', name: 'Piazza San Marco', address: 'Piazza San Marco', city: 'Venezia', latitude: 45.4345, longitude: 12.3397 },
];

export function LocationPickerScreen({ navigation, route }: LocationPickerScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [isManualMode, setIsManualMode] = useState(false);

  // Get current location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          setIsLoadingLocation(true);
          const location = await ExpoLocation.getCurrentPositionAsync({});
          setCurrentPosition({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.log('Error getting location:', error);
      } finally {
        setIsLoadingLocation(false);
      }
    })();
  }, []);

  // Filter locations based on search query
  const filteredLocations = PLACEHOLDER_LOCATIONS.filter(loc =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (location: Location) => {
    setSelectedLocation(location);
    setIsManualMode(false);
  };

  const handleUseCurrentLocation = () => {
    if (currentPosition) {
      setIsManualMode(true);
      setSelectedLocation({
        id: 'current',
        name: customName || 'Posizione attuale',
        address: customAddress || '',
        city: customCity || '',
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
      });
    } else {
      Alert.alert('Errore', 'Posizione non disponibile. Assicurati di aver concesso i permessi di localizzazione.');
    }
  };

  const handleConfirm = () => {
    if (isManualMode) {
      if (!customName.trim()) {
        Alert.alert('Errore', 'Inserisci il nome del luogo');
        return;
      }
      if (!customCity.trim()) {
        Alert.alert('Errore', 'Inserisci la città');
        return;
      }
      
      const location: Location = {
        id: Date.now().toString(),
        name: customName.trim(),
        address: customAddress.trim(),
        city: customCity.trim(),
        latitude: currentPosition?.latitude,
        longitude: currentPosition?.longitude,
      };
      
      // Navigate back with location data
      navigation.navigate('CreateEvent', { 
        ...route.params,
        location 
      } as any);
    } else if (selectedLocation) {
      navigation.navigate('CreateEvent', { 
        ...route.params,
        location: selectedLocation 
      } as any);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seleziona luogo</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cerca un luogo..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Info text about Google Places */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            La ricerca automatica con Google Places sarà disponibile prossimamente. Per ora puoi usare la posizione attuale o inserire manualmente il luogo.
          </Text>
        </View>

        {/* Current Location Button */}
        <TouchableOpacity 
          style={styles.currentLocationBtn}
          onPress={handleUseCurrentLocation}
        >
          {isLoadingLocation ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Ionicons name="locate" size={24} color={colors.primary} />
          )}
          <View style={styles.currentLocationText}>
            <Text style={styles.currentLocationTitle}>Usa posizione attuale</Text>
            <Text style={styles.currentLocationSubtitle}>
              {currentPosition 
                ? `${currentPosition.latitude.toFixed(4)}, ${currentPosition.longitude.toFixed(4)}`
                : 'Localizzazione in corso...'
              }
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>

        {/* Manual Entry Mode */}
        {isManualMode && (
          <View style={styles.manualEntrySection}>
            <Text style={styles.sectionTitle}>Dettagli luogo</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome del posto *</Text>
              <TextInput
                style={styles.input}
                placeholder="Es: Piazza Duomo"
                placeholderTextColor={colors.textSecondary}
                value={customName}
                onChangeText={setCustomName}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Indirizzo</Text>
              <TextInput
                style={styles.input}
                placeholder="Via/Piazza..."
                placeholderTextColor={colors.textSecondary}
                value={customAddress}
                onChangeText={setCustomAddress}
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Città *</Text>
              <TextInput
                style={styles.input}
                placeholder="Es: Milano"
                placeholderTextColor={colors.textSecondary}
                value={customCity}
                onChangeText={setCustomCity}
              />
            </View>
          </View>
        )}

        {/* Divider */}
        {!isManualMode && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>oppure seleziona</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Suggested Locations */}
            <Text style={styles.sectionTitle}>Luoghi suggeriti</Text>
            
            {filteredLocations.map((location) => (
              <TouchableOpacity
                key={location.id}
                style={[
                  styles.locationItem,
                  selectedLocation?.id === location.id && styles.locationItemSelected
                ]}
                onPress={() => handleSelectLocation(location)}
              >
                <View style={styles.locationIcon}>
                  <Ionicons 
                    name="location" 
                    size={20} 
                    color={selectedLocation?.id === location.id ? colors.primary : colors.textSecondary} 
                  />
                </View>
                <View style={styles.locationInfo}>
                  <Text style={styles.locationName}>{location.name}</Text>
                  <Text style={styles.locationAddress}>
                    {location.address}, {location.city}
                  </Text>
                </View>
                {selectedLocation?.id === location.id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}

            {filteredLocations.length === 0 && searchQuery.length > 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                <Text style={styles.emptyStateText}>
                  Nessun luogo trovato per "{searchQuery}"
                </Text>
                <Button
                  title="Inserisci manualmente"
                  onPress={() => setIsManualMode(true)}
                  variant="outline"
                  size="small"
                />
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Footer with Confirm Button */}
      <View style={styles.footer}>
        <Button
          title="Conferma luogo"
          onPress={handleConfirm}
          disabled={!selectedLocation && !isManualMode}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    ...typography.body,
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  currentLocationText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  currentLocationTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  currentLocationSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  manualEntrySection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginHorizontal: spacing.md,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  locationItemSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}10`,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  locationName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  locationAddress: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
