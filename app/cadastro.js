import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';

const notify = async (title, body) => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, ...(Platform.OS === 'android' && { channelId: 'default' }) }, trigger: null });
  } catch (_) {}
};

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  web: 'http://localhost:3000',
});

const FIELDS = [
  { key: 'carro',    label: 'NOME DO VEÍCULO', placeholder: 'ex: Ford Ka',        icon: 'car-outline',     keyboard: 'default',     max: 50  },
  { key: 'modelo',   label: 'MODELO',          placeholder: 'ex: SE 1.0',          icon: 'build-outline',   keyboard: 'default',     max: 30  },
  { key: 'ano',      label: 'ANO',             placeholder: 'ex: 2022',            icon: 'calendar-outline',keyboard: 'numeric',     max: 4   },
  { key: 'problema', label: 'PROBLEMA',        placeholder: 'ex: Troca de óleo',   icon: 'warning-outline', keyboard: 'default',     max: 100 },
  { key: 'custo',    label: 'CUSTO (R$)',       placeholder: 'ex: 350000',          icon: 'cash-outline',    keyboard: 'decimal-pad', max: 10  },
];

export default function Cadastro() {
  const router = useRouter();
  const [values, setValues] = useState({ carro: '', modelo: '', ano: '', problema: '', custo: '' });
  const [focused, setFocused] = useState(null);

  const setValue = (key, val) => setValues(prev => ({ ...prev, [key]: val }));

  const handleSubmit = async () => {
    if (Object.values(values).some(v => !v.trim())) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos!');
      return;
    }

    const anoNum = parseInt(values.ano.trim(), 10);
    const anoAtual = new Date().getFullYear();
    if (isNaN(anoNum) || anoNum < 1900 || anoNum > anoAtual + 1) {
      Alert.alert('Ano inválido', `Insira um ano entre 1900 e ${anoAtual}.`);
      return;
    }

    const custoNum = parseFloat(values.custo.trim().replace(',', '.'));
    if (isNaN(custoNum) || custoNum <= 0) {
      Alert.alert('Custo inválido', 'Insira um valor positivo (ex: 350.00).');
      return;
    }

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        Alert.alert('Sem conexão', 'Verifique sua internet e tente novamente.');
        return;
      }
    } catch (_) {}

    try {
      const response = await fetch(`${API_URL}/carros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: values.carro.trim(),
          modelo: values.modelo.trim(),
          ano: anoNum,
          problema: values.problema.trim(),
          custo: custoNum,
        }),
      });

      if (response.ok) {
        await notify('Veículo cadastrado! 🚗', `${values.carro.trim()} foi adicionado ao sistema.`);
        Alert.alert('Sucesso', 'Veículo cadastrado com sucesso!');
        setValues({ carro: '', modelo: '', ano: '', problema: '', custo: '' });
      } else {
        throw new Error();
      }
    } catch {
      Alert.alert('Erro de conexão', 'Não foi possível conectar ao servidor.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Cabeçalho da seção */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="car-sport-outline" size={24} color="#4A9FE0" />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.sectionTitle}>Novo Registro</Text>
            <Text style={styles.sectionSubtitle}>Preencha os dados do veículo</Text>
          </View>
        </View>

        {/* Card do formulário */}
        <View style={styles.card}>
          {FIELDS.map(({ key, label, placeholder, icon, keyboard, max }) => (
            <View key={key} style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name={icon} size={13} color="#4A9FE0" />
                <Text style={styles.label}>{label}</Text>
              </View>
              <TextInput
                style={[styles.input, focused === key && styles.inputFocused]}
                placeholder={placeholder}
                placeholderTextColor="#2A4A6A"
                keyboardType={keyboard}
                value={values[key]}
                onChangeText={val => setValue(key, val)}
                maxLength={max}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
              />
            </View>
          ))}
        </View>

        {/* Botão primário */}
        <TouchableOpacity style={styles.botaoPrimario} onPress={handleSubmit} activeOpacity={0.85}>
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.textoBotao}>Cadastrar Veículo</Text>
        </TouchableOpacity>

        {/* Botão secundário (outline) */}
        <TouchableOpacity style={styles.botaoSecundario} onPress={() => router.push('/registros')} activeOpacity={0.85}>
          <Ionicons name="bar-chart-outline" size={20} color="#4A9FE0" />
          <Text style={styles.textoBotaoSec}>Ver Dashboard</Text>
        </TouchableOpacity>

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
    backgroundColor: '#001E3C',
    padding: 20,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  sectionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#002B5C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1A4A7A',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8FBAD8',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#002B5C',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1A4A7A',
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  inputGroup: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 7,
  },
  label: {
    fontSize: 11,
    color: '#8FBAD8',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: '#001A38',
    color: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#1A4A7A',
  },
  inputFocused: {
    borderColor: '#4A9FE0',
  },
  botaoPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0061A8',
    paddingVertical: 15,
    borderRadius: 12,
    gap: 8,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#0061A8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
  },
  botaoSecundario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#1A4A7A',
    gap: 8,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  textoBotaoSec: {
    color: '#4A9FE0',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
