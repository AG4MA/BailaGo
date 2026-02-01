import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
};

export default function RegisterScreen({ navigation }: Props) {
  const { register, loginWithGoogle, loginWithInstagram, isLoading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nickname: '',
    firstName: '',
    lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [step, setStep] = useState(1); // Step 1: dati personali, Step 2: credenziali

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Nome richiesto';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Cognome richiesto';
    }

    if (!formData.nickname.trim()) {
      newErrors.nickname = 'Nickname richiesto';
    } else if (formData.nickname.length < 2) {
      newErrors.nickname = 'Nickname minimo 2 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email richiesta';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email non valida';
    }

    if (!formData.password) {
      newErrors.password = 'Password richiesta';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimo 6 caratteri';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Le password non coincidono';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.nickname.toLowerCase().replace(/\s/g, '_'),
      });

      Alert.alert(
        'Registrazione completata!',
        'Controlla la tua email per verificare l\'account.',
        [{ text: 'OK', onPress: () => navigation.navigate('VerifyEmail', { email: formData.email }) }]
      );
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore durante la registrazione');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore con Google');
    }
  };

  const handleInstagramLogin = async () => {
    try {
      await loginWithInstagram();
    } catch (error: any) {
      Alert.alert('Errore', error.message || 'Errore con Instagram');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="person-add" size={50} color="#E91E63" />
          </View>
          <Text style={styles.title}>Crea il tuo account</Text>
          <Text style={styles.subtitle}>
            {step === 1 ? 'I tuoi dati personali' : 'Le tue credenziali'}
          </Text>
          
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
          </View>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {step === 1 ? (
            <>
              <Input
                label="Nome"
                value={formData.firstName}
                onChangeText={(v: string) => updateField('firstName', v)}
                placeholder="Il tuo nome"
                error={errors.firstName}
                leftIcon={<Ionicons name="person-outline" size={20} color="#666" />}
              />

              <Input
                label="Cognome"
                value={formData.lastName}
                onChangeText={(v: string) => updateField('lastName', v)}
                placeholder="Il tuo cognome"
                error={errors.lastName}
                leftIcon={<Ionicons name="person-outline" size={20} color="#666" />}
              />

              <Input
                label="Nickname"
                value={formData.nickname}
                onChangeText={(v: string) => updateField('nickname', v)}
                placeholder="Come vuoi essere chiamato"
                error={errors.nickname}
                autoCapitalize="none"
                leftIcon={<Ionicons name="at" size={20} color="#666" />}
              />

              <Button
                title="Continua"
                onPress={handleNext}
                style={styles.nextButton}
              />
            </>
          ) : (
            <>
              <Input
                label="Email"
                value={formData.email}
                onChangeText={(v: string) => updateField('email', v)}
                placeholder="La tua email"
                keyboardType="email-address"
                autoCapitalize="none"
                error={errors.email}
                leftIcon={<Ionicons name="mail-outline" size={20} color="#666" />}
              />

              <Input
                label="Password"
                value={formData.password}
                onChangeText={(v: string) => updateField('password', v)}
                placeholder="Crea una password"
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
                label="Conferma Password"
                value={formData.confirmPassword}
                onChangeText={(v: string) => updateField('confirmPassword', v)}
                placeholder="Ripeti la password"
                secureTextEntry={!showPassword}
                error={errors.confirmPassword}
                leftIcon={<Ionicons name="lock-closed-outline" size={20} color="#666" />}
              />

              <View style={styles.buttonRow}>
                <Button
                  title="Indietro"
                  onPress={handleBack}
                  variant="outline"
                  style={styles.backButton}
                />
                <Button
                  title="Registrati"
                  onPress={handleRegister}
                  loading={isLoading}
                  style={styles.registerButton}
                />
              </View>
            </>
          )}
        </View>

        {/* Divider - solo al primo step */}
        {step === 1 && (
          <>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>oppure registrati con</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Social login */}
            <View style={styles.socialButtons}>
              <TouchableOpacity
                style={[styles.socialButton, styles.googleButton]}
                onPress={handleGoogleLogin}
              >
                <Ionicons name="logo-google" size={24} color="#fff" />
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.socialButton, styles.instagramButton]}
                onPress={handleInstagramLogin}
              >
                <Ionicons name="logo-instagram" size={24} color="#fff" />
                <Text style={styles.socialButtonText}>Instagram</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Link login */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Hai già un account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Accedi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FCE4EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ddd',
  },
  stepDotActive: {
    backgroundColor: '#E91E63',
  },
  stepLine: {
    width: 60,
    height: 2,
    backgroundColor: '#ddd',
    marginHorizontal: 8,
  },
  form: {
    marginBottom: 24,
  },
  nextButton: {
    marginTop: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  backButton: {
    flex: 1,
  },
  registerButton: {
    flex: 2,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  googleButton: {
    backgroundColor: '#DB4437',
  },
  instagramButton: {
    backgroundColor: '#C13584',
  },
  socialButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 20,
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
});
