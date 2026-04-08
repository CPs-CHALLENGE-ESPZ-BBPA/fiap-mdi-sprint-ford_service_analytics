import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function Sobre() {
  const router = useRouter();

  return (
    
    <View style={styles.container}>
      
      <Image
        source={require("../assets/fiap-logo.png")}
        style={styles.imagem}
      />

      <Text style={styles.titulo}>Presença Inteligente</Text>

      <Text style={styles.descricao}>
        Este projeto foi desenvolvido com o objetivo de modernizar o controle de presença
        dos alunos.
      </Text>

      <Text style={styles.descricao}>
        A proposta é permitir que o aluno registre sua presença de forma independente,
        diretamente pelo aplicativo, sem necessidade de chamadas manuais.
      </Text>

      <Text style={styles.descricao}>
        Para garantir a autenticidade, a presença só pode ser marcada quando o aluno
        estiver conectado ao Wi-Fi da FIAP ou dentro da área de localização da instituição.
      </Text>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text style={styles.acessar}>Acessar</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D0D0D',
    padding: 20,
  },

  imagem: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#E83D84',
  },

  titulo: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#E83D84',
    marginBottom: 12,
  },

  descricao: {
    fontSize: 15,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 22,
  },

  acessar: {
    fontSize: 16,
    color: '#E83D84',
    fontWeight: '600',
    marginTop: 20,
  },
});