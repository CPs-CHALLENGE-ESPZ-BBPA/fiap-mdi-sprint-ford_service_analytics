// index.js
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router'; // Para navegar entre as telas
import { useState } from 'react';

export default function Login() {
  const router = useRouter();  // Hook para navegação
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const validarLogin = () => {
    // Verificar se os campos não estão vazios
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    // Validar login (em um cenário real, seria uma validação com backend)
    if (email === 'a' && senha === 'a') {
      router.push('/cadastro');  // Redireciona para a tela de cadastro
    } else {
      Alert.alert('Erro', 'E-mail ou senha inválidos');
    }
  };

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

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#003C71', // Azul escuro Ford
    padding: 20,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF', // Branco para o texto do título
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1A1A1A', // Fundo escuro para o campo de input
    color: '#FFFFFF', // Texto branco
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#0061A8', // Azul claro para o contorno do campo
  },
  botao: {
    backgroundColor: '#0061A8', // Azul claro Ford
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  textoBotao: {
    color: '#FFFFFF', // Branco para o texto do botão
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#E83D84', // Cor de destaque para o link (rosa Ford)
    textAlign: 'center',
    marginTop: 20,
  },
});