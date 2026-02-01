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
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
  route: RouteProp<RootStackParamList, 'ResetPassword'>;
};

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const { resetPassword, isLoading } = useAuth();
  const { token } = route.params;
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      newErrors.password = 'Password richiesta';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimo 6 caratteri';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Token scaduto o non valido');
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
          </View>
          <Text style={styles.title}>Password aggiornata!</Text>
          <Text style={styles.description}>
            La tua password è stata reimpostata con successo. Ora puoi accedere con le nuove credenziali.
          </Text>
          
          <Button
            title="Vai al Login"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
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
        <View style={styles.iconContainer}>
          <Ionicons name="key" size={60} color="#E91E63" />
        </View>
        
        <Text style={styles.title}>Nuova password</Text>
        <Text style={styles.description}>
          Crea una nuova password sicura per il tuo account.
        </Text>

        <View style={styles.form}>
          <Input
            label="Nuova password"
            value={password}
            onChangeText={setPassword}
            placeholder="Inserisci nuova password"
            secureTextEntry={!showPassword}
            error={errors.password}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            }
          />

          <Input
            label="Conferma password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Ripeti la password"
            secureTextEntry={!showPassword}
            error={errors.confirmPassword}
            leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
          />

          <View style={styles.requirements}>
            <Text style={styles.requirementsTitle}>La password deve contenere:</Text>
            <View style={styles.requirement}>
              <Ionicons 
                name={password.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                size={16} 
                color={password.length >= 6 ? '#4CAF50' : '#999'} 
              />
              <Text style={[styles.requirementText, password.length >= 6 && styles.requirementMet]}>
                Almeno 6 caratteri
              </Text>
            </View>
          </View>

          <Button
            title="Reimposta password"
            onPress={handleSubmit}
            loading={isLoading}
            style={styles.button}
          />
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
  successIcon: {
    alignItems: 'center',
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
  form: {
    marginBottom: 24,
  },
  requirements: {
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 14,
    color: '#999',
  },
  requirementMet: {
    color: '#4CAF50',
  },
  button: {
    marginTop: 16,
  },
});
