import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const notify = async (title, body) => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, ...(Platform.OS === 'android' && { channelId: 'default' }) }, trigger: null });
  } catch (_) {}
};

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await AsyncStorage.getItem('userSession');
        if (session) router.replace('/cadastro');
      } catch (_) {}
    };
    checkSession();
  }, []);

  const validarLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha e-mail e senha para continuar.');
      return;
    }
    if (email === 'a' && senha === 'a') {
      try {
        await AsyncStorage.setItem('userSession', JSON.stringify({ email, loggedAt: Date.now() }));
      } catch (_) {}
      await notify('Login realizado!', 'Bem-vindo ao Ford Service Analytics.');
      router.replace('/cadastro');
    } else {
      Alert.alert('Acesso negado', 'E-mail ou senha inválidos.');
    }
  };

  const inputStyle = (field) => [
    styles.inputWrapper,
    focusedField === field && styles.inputWrapperFocused,
  ];

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Logo + título */}
        <View style={styles.header}>
          <Image source={require('../assets/ford-logo.png')} style={styles.logo} />
          <Text style={styles.appName}>Ford Service Analytics</Text>
          <Text style={styles.appSubtitle}>GERENCIAMENTO DE OFICINA</Text>
        </View>

        {/* Card do formulário */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-MAIL</Text>
            <View style={inputStyle('email')}>
              <Ionicons name="mail-outline" size={18} color="#4A9FE0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite seu e-mail"
                placeholderTextColor="#3A5A7A"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>SENHA</Text>
            <View style={inputStyle('senha')}>
              <Ionicons name="lock-closed-outline" size={18} color="#4A9FE0" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Digite sua senha"
                placeholderTextColor="#3A5A7A"
                secureTextEntry
                value={senha}
                onChangeText={setSenha}
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.botao} onPress={validarLogin} activeOpacity={0.85}>
            <Text style={styles.textoBotao}>Entrar</Text>
            <Ionicons name="arrow-forward-circle-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>Ford Motor Company © 2025</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#001E3C',
  },
  container: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001E3C',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logo: {
    width: 130,
    height: 65,
    resizeMode: 'contain',
    marginBottom: 18,
  },
  appName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  appSubtitle: {
    fontSize: 11,
    color: '#4A9FE0',
    marginTop: 6,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#002B5C',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1A4A7A',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 22,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 11,
    color: '#8FBAD8',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 7,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#001A38',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1A4A7A',
    paddingHorizontal: 14,
  },
  inputWrapperFocused: {
    borderColor: '#4A9FE0',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    color: '#FFFFFF',
    fontSize: 15,
  },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0061A8',
    paddingVertical: 15,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    elevation: 6,
    shadowColor: '#0061A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    marginTop: 36,
    color: '#2A5A8A',
    fontSize: 12,
    letterSpacing: 0.5,
  },
});
