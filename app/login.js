import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  function validarLogin() {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (email === 'rm123456@fiap.com.br' && senha === 'admin') {
      router.push('profile');
    } else {
      Alert.alert('Erro', 'E-mail ou senha inválidos');
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#888"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />

      <TouchableOpacity style={styles.botao} onPress={validarLogin}>
        <Text style={styles.textoBotao}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/')}>
        <Text style={styles.link}>Sobre o projeto</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E83D84',
    marginBottom: 30,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },

  botao: {
    backgroundColor: '#E83D84',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },

  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },

  link: {
    color: '#E83D84',
    textAlign: 'center',
    marginTop: 20,
  },
});