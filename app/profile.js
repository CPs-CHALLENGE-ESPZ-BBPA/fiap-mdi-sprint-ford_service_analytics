import { View, Text, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Button from '../components/Button';
import Message from '../components/Message';
import LoadingOverlay from '../components/LoadingOverlay';
import { validateLocation } from '../utils/locationService';
import { checkWifiConnection } from '../utils/wifiService';

export default function Profile() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Registra presença
  const handleRegisterAttendance = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Valida localização
      const locationResult = await validateLocation();
      
      if (!locationResult.isValid) {
        setMessage({
          type: 'error',
          text: `Você está muito longe da FIAP (${locationResult.distance}m). Aproxime-se da instituição.`
        });
        setLoading(false);
        return;
      }

      // Valida WiFi
      const wifiResult = await checkWifiConnection();
      
      if (!wifiResult.isValid) {
        setMessage({
          type: 'error',
          text: wifiResult.message
        });
        setLoading(false);
        return;
      }

      // Presença validada com sucesso
      setMessage({
        type: 'success',
        text: 'Presença registrada com sucesso!'
      });

    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Erro ao registrar presença'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LoadingOverlay visible={loading} message="Validando..." />

      <Image
        source={require("../assets/fiap-logo.png")}
        style={styles.imagem}
      />

      <Text style={styles.nome}>Usuário</Text>
      <Text style={styles.info}>RM: 123456</Text>
      <Text style={styles.info}>usuario@fiap.com.br</Text>

      <Message type={message.type} message={message.text} />

      <Button
        title="Registrar Presença"
        onPress={handleRegisterAttendance}
        style={styles.botao}
      />

      <Text style={styles.logout} onPress={() => router.back()}>
        Sair
      </Text>

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
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#E83D84',
  },

  nome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E83D84',
    marginBottom: 10,
  },

  info: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },

  botao: {
    marginTop: 12,
    width: '80%',
  },

  logout: {
    color: '#E83D84',
    marginTop: 25,
    fontSize: 16,
  },
});