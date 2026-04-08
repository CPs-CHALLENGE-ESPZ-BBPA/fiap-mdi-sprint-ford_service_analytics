import { View, Text, StyleSheet } from 'react-native';

export default function Profile() {
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Perfil do Carro</Text>

      <View style={styles.table}>
        {/* Cabeçalho da Tabela com os campos */}
        <View style={styles.tableRow}>
          <Text style={styles.headerText}>Carro</Text>
          <Text style={styles.headerText}>Modelo</Text>
          <Text style={styles.headerText}>Ano</Text>
          <Text style={styles.headerText}>Problema</Text>
          <Text style={styles.headerText}>Custo</Text>
        </View>

        {/* Linha de Valores correspondentes */}
        <View style={styles.tableRow}>
          <Text style={styles.rowValue}>Nome do Carro</Text>
          <Text style={styles.rowValue}>Modelo do Carro</Text>
          <Text style={styles.rowValue}>2022</Text>
          <Text style={styles.rowValue}>Exemplo de Problema</Text>
          <Text style={styles.rowValue}>R$ 3000,00</Text>
        </View>
      </View>
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
    color: '#FFFFFF', // Texto branco para contraste
    marginBottom: 30,
    textAlign: 'center',
  },
  table: {
    backgroundColor: '#1F3A62', // Azul mais claro para a tabela
    padding: 20,
    borderRadius: 8,
    width: '100%',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', // Alinha os itens na horizontal
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
    color: '#FFFFFF', // Branco para os cabeçalhos
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center', // Centraliza o texto no cabeçalho
    backgroundColor: '#0061A8', // Azul claro Ford
    paddingVertical: 5,
    borderRadius: 5,
  },
  rowValue: {
    flex: 1,
    color: '#FFFFFF', // Texto branco para os valores
    fontSize: 16,
    textAlign: 'center', // Alinha o valor ao centro
  },
});