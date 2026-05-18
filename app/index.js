import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Image, KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sanitizeText, anonymizeEmail } from './utils/security';
import { saveSession, loadSession } from './utils/auth';
import { assignRole } from './utils/rbac';
import { hashPassword, decryptData, encryptData } from './utils/crypto';
import { logger } from './utils/logger';
import { checkLockout, recordFailure, clearFailures } from './utils/bruteForce';

const USUARIOS_KEY = '@usuarios';
const TOAST_ICONS = { success: 'checkmark-circle', error: 'close-circle', warning: 'alert-circle' };

const notify = async (title, body) => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, ...(Platform.OS === 'android' && { channelId: 'default' }) }, trigger: null });
  } catch (_) {}
};

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [showSenha, setShowSenha] = useState(false);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message, type = 'success') => {
    toastAnim.setValue(0);
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const toastTranslateX = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [120, 0] });

  useEffect(() => {
    const checkSession = async () => {
      const session = await loadSession();
      if (session) router.replace('/menu');
    };
    checkSession();
  }, []);

  const validarLogin = async () => {
    if (!email.trim() || !senha) {
      showToast('Preencha e-mail e senha para continuar', 'error');
      return;
    }

    const emailSanitized = sanitizeText(email.trim()).toLowerCase();

    // Credencial de demo
    if (emailSanitized === 'a' && senha === 'a') {
      await saveSession('a', 'Admin', 'admin');
      await notify('Login realizado!', 'Bem-vindo ao Ford Service Analytics.');
      router.replace('/menu');
      return;
    }

    // Verificar bloqueio por tentativas repetidas
    const lockoutMins = await checkLockout(emailSanitized);
    if (lockoutMins > 0) {
      logger.warn('LOGIN_BLOCKED', { email: emailSanitized, lockoutMins });
      showToast(`Conta bloqueada. Tente novamente em ${lockoutMins} min.`, 'error');
      return;
    }

    // Verificar usuários cadastrados
    try {
      const raw = await AsyncStorage.getItem(USUARIOS_KEY);
      let usuarios = [];
      if (raw) {
        try { usuarios = JSON.parse(decryptData(raw)); }
        catch { try { usuarios = JSON.parse(raw); } catch { usuarios = []; } }
      }

      const senhaHash = hashPassword(senha, emailSanitized);
      const usuario = usuarios.find(u =>
        u.email === emailSanitized &&
        (u.senhaHash ? u.senhaHash === senhaHash : u.senha === senha)
      );

      if (usuario) {
        await clearFailures(emailSanitized);
        logger.audit('LOGIN_SUCCESS', { email: emailSanitized, role: usuario.role });
        // Migrate plaintext password to hash on first login after update
        if (usuario.senha && !usuario.senhaHash) {
          const migrated = usuarios.map(u =>
            u.email === emailSanitized
              ? { ...u, senhaHash: hashPassword(u.senha, u.email), senha: undefined }
              : u
          );
          await AsyncStorage.setItem(USUARIOS_KEY, encryptData(JSON.stringify(migrated)));
        }
        await saveSession(usuario.email, usuario.nome, usuario.role || assignRole(usuario.email));
        await notify('Login realizado!', `Bem-vindo(a), ${usuario.nome.split(' ')[0]}!`);
        router.replace('/menu');
      } else {
        const triggered = await recordFailure(emailSanitized);
        if (triggered) {
          logger.warn('BRUTE_FORCE_DETECTED', { email: emailSanitized });
          showToast('Muitas tentativas. Conta bloqueada por 15 min.', 'error');
        } else {
          logger.warn('LOGIN_FAILURE', { email: emailSanitized });
          showToast('E-mail ou senha inválidos', 'error');
        }
      }
    } catch (_) {
      logger.error('LOGIN_ERROR', { email: emailSanitized });
      showToast('Erro ao verificar credenciais. Tente novamente.', 'error');
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
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

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
                maxLength={80}
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
                secureTextEntry={!showSenha}
                value={senha}
                onChangeText={setSenha}
                maxLength={50}
                onFocus={() => setFocusedField('senha')}
                onBlur={() => setFocusedField(null)}
              />
              <TouchableOpacity onPress={() => setShowSenha(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color="#4A9FE0" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.botao} onPress={validarLogin} activeOpacity={0.85}>
            <Text style={styles.textoBotao}>Entrar</Text>
            <Ionicons name="arrow-forward-circle-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Link cadastro */}
        <TouchableOpacity style={styles.linkCadastro} onPress={() => router.push('/nova-conta')} activeOpacity={0.8}>
          <Text style={styles.linkCadastroText}>Não tem conta? </Text>
          <Text style={styles.linkCadastroDestaque}>Cadastre-se</Text>
          <Ionicons name="arrow-forward-outline" size={14} color="#4A9FE0" style={{ marginLeft: 2 }} />
        </TouchableOpacity>

        <Text style={styles.footer}>Ford Motor Company © 2026</Text>
      </ScrollView>

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          toast.type === 'success' ? styles.toastSuccess
            : toast.type === 'error' ? styles.toastError
            : styles.toastWarning,
          { opacity: toastAnim, transform: [{ translateX: toastTranslateX }] },
        ]}
        pointerEvents="none"
      >
        <Ionicons name={TOAST_ICONS[toast.type]} size={18} color="#FFFFFF" />
        <Text style={styles.toastText}>{toast.message}</Text>
      </Animated.View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#001E3C' },
  container: {
    flexGrow: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#001E3C', paddingHorizontal: 24,
  },
  header: { alignItems: 'center', marginBottom: 36 },
  logo: { width: 130, height: 65, resizeMode: 'contain', marginBottom: 18 },
  appName: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: 0.5, textAlign: 'center' },
  appSubtitle: { fontSize: 11, color: '#4A9FE0', marginTop: 6, letterSpacing: 2.5, textAlign: 'center' },

  card: {
    width: '100%', backgroundColor: '#002B5C', borderRadius: 20, padding: 24,
    borderWidth: 1, borderColor: '#1A4A7A', elevation: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10,
  },
  cardTitle: { fontSize: 19, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 22 },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, color: '#8FBAD8', fontWeight: '700', letterSpacing: 1.2, marginBottom: 7 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#001A38', borderRadius: 10,
    borderWidth: 1, borderColor: '#1A4A7A', paddingHorizontal: 14,
  },
  inputWrapperFocused: { borderColor: '#4A9FE0' },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, height: 50, color: '#FFFFFF', fontSize: 15 },

  botao: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0061A8', paddingVertical: 15, borderRadius: 12,
    marginTop: 10, gap: 8, elevation: 6,
    shadowColor: '#0061A8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8,
  },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },

  linkCadastro: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginTop: 20, paddingVertical: 10,
  },
  linkCadastroText: { color: '#8FBAD8', fontSize: 14 },
  linkCadastroDestaque: { color: '#4A9FE0', fontSize: 14, fontWeight: 'bold' },

  footer: { marginTop: 24, color: '#2A5A8A', fontSize: 12, letterSpacing: 0.5 },

  toast: {
    position: 'absolute', bottom: 28, right: 16,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12,
    maxWidth: '85%', elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8,
  },
  toastSuccess: { backgroundColor: '#1A6B3A' },
  toastError:   { backgroundColor: '#7A1A1A' },
  toastWarning: { backgroundColor: '#6B4A00' },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1 },
});
