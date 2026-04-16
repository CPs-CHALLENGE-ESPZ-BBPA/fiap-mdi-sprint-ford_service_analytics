import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';

// ajustar IP
import { Platform } from "react-native";

const API_URL = Platform.select({
  android: "http://10.0.2.2:3000",
  ios: "http://localhost:3000",
  web: "http://localhost:3000",
});
export default function Cadastro() {
  const router = useRouter();

  const [carro, setCarro] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [problema, setProblema] = useState('');
  const [custo, setCusto] = useState('');

  const handleSubmit = async () => {
    if (!carro || !modelo || !ano || !problema || !custo) {
      Alert.alert('Erro', 'Preencha todos os campos!');
      return;
    }

    const carData = {
      nome: carro,
      modelo,
      ano,
      problema,
      custo: parseFloat(custo),
    };

    try {
      const response = await fetch(`${API_URL}/carros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(carData),
      });

      if (response.ok) {
        // Feedback sucesso
        Alert.alert('Sucesso', 'Carro cadastrado com sucesso!');

        // Limpa os campos
        setCarro('');
        setModelo('');
        setAno('');
        setProblema('');
        setCusto('');
      } else {
        throw new Error('Erro ao cadastrar');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Carro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Carro"
        placeholderTextColor="#ccc"
        value={carro}
        onChangeText={setCarro}
      />

      <TextInput
        style={styles.input}
        placeholder="Modelo"
        placeholderTextColor="#ccc"
        value={modelo}
        onChangeText={setModelo}
      />

      <TextInput
        style={styles.input}
        placeholder="Ano"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={ano}
        onChangeText={setAno}
      />

      <TextInput
        style={styles.input}
        placeholder="Problema"
        placeholderTextColor="#ccc"
        value={problema}
        onChangeText={setProblema}
      />

      <TextInput
        style={styles.input}
        placeholder="Custo (R$)"
        placeholderTextColor="#ccc"
        keyboardType="numeric"
        value={custo}
        onChangeText={setCusto}
      />

      <TouchableOpacity style={styles.botao} onPress={handleSubmit}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.botao, { backgroundColor: '#0061A8' }]}
        onPress={() => router.push('/registros')}
      >
        <Text style={styles.textoBotao}>Ver Registros</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003C71',
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1F3A62',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#0061A8',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 15,
    width: '100%',
  },
  textoBotao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});