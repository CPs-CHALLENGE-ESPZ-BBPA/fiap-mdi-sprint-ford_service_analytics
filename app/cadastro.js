import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';  // Hook de navegação

export default function Cadastro() {
  const router = useRouter();  // Hook para navegação
  const [carro, setCarro] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [problema, setProblema] = useState('');
  const [custo, setCusto] = useState('');

  const handleSubmit = () => {
    // Verificação simples dos dados
    if (!carro || !modelo || !ano || !problema || !custo) {
      alert('Preencha todos os campos!');
      return;
    }

    // Exemplo de como os dados poderiam ser passados (aqui não há navegação real)
    alert(`Cadastro de ${carro} realizado!`);
  };

  const goToProfile = () => {
    // Navegar para a tela Profile após o cadastro
    router.push({
      pathname: '/profile',  // Caminho para a tela Profile
      query: { carro, modelo, ano, problema, custo },  // Passando os dados como query
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Cadastro de Carro</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Carro"
        value={carro}
        onChangeText={setCarro}
      />
      <TextInput
        style={styles.input}
        placeholder="Modelo"
        value={modelo}
        onChangeText={setModelo}
      />
      <TextInput
        style={styles.input}
        placeholder="Ano"
        keyboardType="numeric"
        value={ano}
        onChangeText={setAno}
      />
      <TextInput
        style={styles.input}
        placeholder="Problema Encontrado"
        value={problema}
        onChangeText={setProblema}
      />
      <TextInput
        style={styles.input}
        placeholder="Custo (R$)"
        keyboardType="numeric"
        value={custo}
        onChangeText={setCusto}
      />

      <TouchableOpacity style={styles.botao} onPress={handleSubmit}>
        <Text style={styles.textoBotao}>Cadastrar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botao} onPress={goToProfile}>
        <Text style={styles.textoBotao}>Ir para o Perfil</Text>
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
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF', // Branco para contraste
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#1C1C1C', // Fundo escuro para os inputs
    color: '#FFFFFF', // Texto branco
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  botao: {
    backgroundColor: '#0061A8', // Azul claro Ford
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
  },
  textoBotao: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // Texto branco no botão
    textAlign: 'center',
  },
});