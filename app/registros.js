import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = "http://10.3.32.23:3000"; // seu IP local

export default function Registros() {
  const router = useRouter();
  const [cars, setCars] = useState([]);

  // Buscar carros da API
  const fetchCars = async () => {
    try {
      const response = await fetch(`${API_URL}/carros`);
      const data = await response.json();
      setCars(data);
    } catch (err) {
      console.error('Erro ao buscar os carros:', err);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  // Renderiza cada linha da tabela
  const renderRow = ({ item, index }) => (
    <View
      style={[
        styles.row,
        { backgroundColor: index % 2 === 0 ? '#1F3A62' : '#26547C' }, // linhas alternadas
      ]}
    >
      <Text style={styles.cell}>{item.nome}</Text>
      <Text style={styles.cell}>{item.modelo}</Text>
      <Text style={styles.cell}>{item.ano}</Text>
      <Text style={styles.cell}>{item.problema}</Text>
      <Text style={styles.cell}>{item.custo}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Botão voltar */}
      <TouchableOpacity
        style={styles.botaoVoltar}
        onPress={() => router.push('/cadastro')}
      >
        <Text style={styles.textoBotao}>← Voltar para Cadastro</Text>
      </TouchableOpacity>

      {/* Tabela */}
      <ScrollView horizontal contentContainerStyle={{ alignItems: 'center' }}>
        <View>
          {/* Cabeçalho */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell]}>Nome</Text>
            <Text style={[styles.cell, styles.headerCell]}>Modelo</Text>
            <Text style={[styles.cell, styles.headerCell]}>Ano</Text>
            <Text style={[styles.cell, styles.headerCell]}>Problema</Text>
            <Text style={[styles.cell, styles.headerCell]}>Custo</Text>
          </View>

          {/* Linhas */}
          <FlatList
            data={cars}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRow}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#003C71',
    padding: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#0061A8',
  },
  headerRow: {
    backgroundColor: '#0061A8',
  },
  cell: {
    padding: 10,
    minWidth: 100,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 16,
  },
  headerCell: {
    fontWeight: 'bold',
  },
  botaoVoltar: {
    backgroundColor: '#00A86B',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 15,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});