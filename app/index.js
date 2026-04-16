// index.js
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const validarLogin = () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    if (email === 'a' && senha === 'a') {
      router.push('/cadastro');
    } else {
      Alert.alert('Erro', 'E-mail ou senha inválidos');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/ford-logo.png')}
        style={styles.logo}
      />
      <Text style={styles.appTitulo}>Ford Service App</Text>

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

  appTitulo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },

  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 25,
    textAlign: 'center',
  },

  input: {
    width: '100%',          
    backgroundColor: '#000D2A',
    color: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#0061A8',
  },

  botao: {
    width: '100%',        
    backgroundColor: '#0061A8',
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

  logo: {
  width: 120,
  height: 60,
  resizeMode: 'contain',
  marginBottom: 15,
  },

});