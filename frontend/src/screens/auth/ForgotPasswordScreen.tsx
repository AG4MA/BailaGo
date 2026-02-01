import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { forgotPassword, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const validate = (): boolean => {
    if (!email) {
      setError('Email richiesta');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email non valida');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante la richiesta');
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail-open" size={60} color="#E91E63" />
          </View>
          <Text style={styles.title}>Email inviata!</Text>
          <Text style={styles.description}>
            Se l'indirizzo {email} è registrato, riceverai un link per reimpostare la password.
          </Text>
          <Text style={styles.tip}>
            Controlla anche la cartella spam
          </Text>
          
          <Button
            title="Torna al Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
          
          <TouchableOpacity
            style={styles.resendLink}
            onPress={() => setSent(false)}
          >
            <Text style={styles.resendText}>Non hai ricevuto l'email? Riprova</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.iconContainer}>
          <Ionicons name="lock-open" size={60} color="#E91E63" />
        </View>
        
        <Text style={styles.title}>Password dimenticata?</Text>
        <Text style={styles.description}>
          Inserisci l'email associata al tuo account. Ti invieremo un link per reimpostare la password.
        </Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={(value: string) => {
              setEmail(value);
              if (error) setError('');
            }}
            placeholder="La tua email"
            keyboardType="email-address"
            autoCapitalize="none"
            error={error}
            leftIcon={<Ionicons name="mail-outline" size={20} color="#666" />}
          />

          <Button
            title="Invia link di reset"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Ricordi la password? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Accedi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
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
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
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
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  tip: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  footerLink: {
    color: '#E91E63',
    fontSize: 16,
    fontWeight: '600',
  },
  resendLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    color: '#E91E63',
    fontSize: 14,
  },
});
