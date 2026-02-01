import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'VerifyEmail'>;
  route: RouteProp<RootStackParamList, 'VerifyEmail'>;
};

export default function VerifyEmailScreen({ navigation, route }: Props) {
  const { resendVerification, isLoading, user } = useAuth();
  const { email } = route.params;
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    // Se l'utente è già verificato, vai alla home
    if (user?.emailVerified) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      });
    }
  }, [user?.emailVerified]);

  const handleResend = async () => {
    try {
      await resendVerification();
      setCountdown(60); // 60 secondi prima di poter reinviare
      Alert.alert('Fatto!', 'Email di verifica inviata nuovamente.');
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante l\'invio');
    }
  };

  const handleContinue = () => {
    // L'utente può continuare senza verificare, ma alcune funzionalità saranno limitate
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="mail-unread" size={60} color="#E91E63" />
        </View>
        
        <Text style={styles.title}>Verifica la tua email</Text>
        
        <Text style={styles.description}>
          Abbiamo inviato un link di verifica a:
        </Text>
        
        <Text style={styles.email}>{email}</Text>
        
        <Text style={styles.instructions}>
          Clicca sul link nell'email per attivare il tuo account. 
          Se non trovi l'email, controlla la cartella spam.
        </Text>

        <View style={styles.buttons}>
          <Button
            title={countdown > 0 ? `Rinvia tra ${countdown}s` : 'Rinvia email'}
            onPress={handleResend}
            loading={isLoading}
            disabled={countdown > 0}
            variant="outline"
          />

          <Button
            title="Continua senza verificare"
            onPress={handleContinue}
            style={styles.continueButton}
          />
        </View>

        <View style={styles.warning}>
          <Ionicons name="information-circle" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Alcune funzionalità saranno limitate finché non verifichi l'email.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.changeEmail}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.changeEmailText}>
            Email errata? Torna al login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E91E63',
    textAlign: 'center',
    marginVertical: 12,
  },
  instructions: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  buttons: {
    gap: 12,
    marginBottom: 24,
  },
  continueButton: {
    marginTop: 8,
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 24,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
  },
  changeEmail: {
    alignItems: 'center',
  },
  changeEmailText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
