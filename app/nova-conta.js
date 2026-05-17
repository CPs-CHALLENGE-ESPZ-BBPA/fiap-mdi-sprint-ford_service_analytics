import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { sanitizeText, validateEmail } from './utils/security';

const USUARIOS_KEY = '@usuarios';
const TOAST_ICONS = { success: 'checkmark-circle', error: 'close-circle', warning: 'alert-circle' };

export default function NovaConta() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const clearError = (key) => {
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  };

  const handleCadastro = async () => {
    setErrors({});

    if (!nome.trim() || nome.trim().length < 2) {
      showToast('Informe seu nome completo (mín. 2 caracteres)', 'error');
      setErrors({ nome: true });
      return;
    }
    if (!email.trim() || !validateEmail(email.trim())) {
      showToast('Informe um e-mail válido', 'error');
      setErrors({ email: true });
      return;
    }
    if (!senha || senha.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      setErrors({ senha: true });
      return;
    }
    if (senha !== confirmar) {
      showToast('As senhas não coincidem', 'error');
      setErrors({ confirmar: true });
      return;
    }

    setLoading(true);
    try {
      const raw = await AsyncStorage.getItem(USUARIOS_KEY);
      const usuarios = raw ? JSON.parse(raw) : [];

      const emailNorm = email.trim().toLowerCase();
      if (usuarios.find(u => u.email === emailNorm)) {
        showToast('Este e-mail já está cadastrado', 'error');
        setErrors({ email: true });
        setLoading(false);
        return;
      }

      const novoUsuario = {
        nome: sanitizeText(nome.trim()),
        email: emailNorm,
        senha,
        criadoEm: Date.now(),
      };

      await AsyncStorage.setItem(USUARIOS_KEY, JSON.stringify([...usuarios, novoUsuario]));
      showToast(`Conta criada! Bem-vindo(a), ${nome.trim().split(' ')[0]}.`, 'success');
      setTimeout(() => router.back(), 2000);
    } catch (_) {
      showToast('Erro ao salvar conta. Tente novamente.', 'error');
    }
    setLoading(false);
  };

  const fieldStyle = (key, wrapper = false) => {
    const base = wrapper ? styles.inputWrapper : styles.input;
    const focusedStyle = wrapper ? styles.inputWrapperFocused : styles.inputFocused;
    const errorStyle = wrapper ? styles.inputWrapperError : styles.inputError;
    return [base, focused === key && focusedStyle, errors[key] && errorStyle];
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Cabeçalho */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="person-add-outline" size={24} color="#4A9FE0" />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.sectionTitle}>Criar Conta</Text>
            <Text style={styles.sectionSubtitle}>Preencha seus dados de acesso</Text>
          </View>
        </View>

        {/* Card do formulário */}
        <View style={styles.card}>

          {/* Nome */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="person-outline" size={13} color={errors.nome ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.nome && styles.labelError]}>NOME COMPLETO</Text>
            </View>
            <TextInput
              style={fieldStyle('nome')}
              placeholder="ex: João Silva"
              placeholderTextColor="#2A4A6A"
              value={nome}
              onChangeText={v => { setNome(v); clearError('nome'); }}
              autoCapitalize="words"
              maxLength={60}
              onFocus={() => setFocused('nome')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* E-mail */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="mail-outline" size={13} color={errors.email ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.email && styles.labelError]}>E-MAIL</Text>
            </View>
            <TextInput
              style={fieldStyle('email')}
              placeholder="ex: joao@teste.com"
              placeholderTextColor="#2A4A6A"
              value={email}
              onChangeText={v => { setEmail(v); clearError('email'); }}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={80}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="lock-closed-outline" size={13} color={errors.senha ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.senha && styles.labelError]}>SENHA</Text>
            </View>
            <View style={fieldStyle('senha', true)}>
              <TextInput
                style={styles.inputInner}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#2A4A6A"
                value={senha}
                onChangeText={v => { setSenha(v); clearError('senha'); }}
                secureTextEntry={!showSenha}
                maxLength={50}
                onFocus={() => setFocused('senha')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowSenha(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showSenha ? 'eye-off-outline' : 'eye-outline'} size={18} color="#4A9FE0" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar Senha */}
          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <View style={styles.labelRow}>
              <Ionicons name="lock-closed-outline" size={13} color={errors.confirmar ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.confirmar && styles.labelError]}>CONFIRMAR SENHA</Text>
            </View>
            <View style={fieldStyle('confirmar', true)}>
              <TextInput
                style={styles.inputInner}
                placeholder="Repita a senha"
                placeholderTextColor="#2A4A6A"
                value={confirmar}
                onChangeText={v => { setConfirmar(v); clearError('confirmar'); }}
                secureTextEntry={!showConfirmar}
                maxLength={50}
                onFocus={() => setFocused('confirmar')}
                onBlur={() => setFocused(null)}
              />
              <TouchableOpacity onPress={() => setShowConfirmar(p => !p)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name={showConfirmar ? 'eye-off-outline' : 'eye-outline'} size={18} color="#4A9FE0" />
              </TouchableOpacity>
            </View>
          </View>

        </View>

        {/* Botão criar conta */}
        <TouchableOpacity
          style={[styles.botaoPrimario, loading && styles.botaoDisabled]}
          onPress={handleCadastro}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Ionicons name="person-add-outline" size={20} color="#FFFFFF" />
          <Text style={styles.textoBotao}>{loading ? 'Criando conta...' : 'Criar Conta'}</Text>
        </TouchableOpacity>

        {/* Voltar ao login */}
        <TouchableOpacity style={styles.botaoSecundario} onPress={() => router.back()} activeOpacity={0.85}>
          <Ionicons name="arrow-back-outline" size={18} color="#4A9FE0" />
          <Text style={styles.textoBotaoSec}>Voltar ao Login</Text>
        </TouchableOpacity>

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
  container: { flexGrow: 1, backgroundColor: '#001E3C', padding: 20, paddingBottom: 40 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 4 },
  sectionIconBox: {
    width: 50, height: 50, borderRadius: 14, backgroundColor: '#002B5C',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1A4A7A',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  sectionSubtitle: { fontSize: 13, color: '#8FBAD8', marginTop: 2 },

  card: {
    backgroundColor: '#002B5C', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: '#1A4A7A', marginBottom: 16,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
  },

  inputGroup: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  label: { fontSize: 11, color: '#8FBAD8', fontWeight: '700', letterSpacing: 1.2 },
  labelError: { color: '#E05A5A' },

  input: {
    backgroundColor: '#001A38', color: '#FFFFFF', borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 15,
    borderWidth: 1, borderColor: '#1A4A7A',
  },
  inputFocused: { borderColor: '#4A9FE0' },
  inputError: { borderColor: '#E05A5A' },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#001A38', borderRadius: 10,
    paddingHorizontal: 14, height: 48,
    borderWidth: 1, borderColor: '#1A4A7A',
  },
  inputWrapperFocused: { borderColor: '#4A9FE0' },
  inputWrapperError: { borderColor: '#E05A5A' },
  inputInner: { flex: 1, color: '#FFFFFF', fontSize: 15 },

  botaoPrimario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0061A8', paddingVertical: 15, borderRadius: 12,
    gap: 8, marginBottom: 12, elevation: 6,
    shadowColor: '#0061A8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8,
  },
  botaoDisabled: { opacity: 0.6 },
  botaoSecundario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#1A4A7A', gap: 8,
  },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  textoBotaoSec: { color: '#4A9FE0', fontWeight: 'bold', fontSize: 16 },

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
