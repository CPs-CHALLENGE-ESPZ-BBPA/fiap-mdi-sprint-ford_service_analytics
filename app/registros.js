import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';

const API_URL = "http://10.3.32.23:3000"; // seu IP local

export default function Registros() {
  const router = useRouter();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const response = await fetch(`${API_URL}/carros`);
      const data = await response.json();
      setCars(data);
    } catch (err) {
      console.error('Erro ao buscar os carros:', err);
    }
  };

  // Dashboard
  const totalCarros = cars.length;
  const custoTotal = cars.reduce((acc, car) => acc + (car.custo || 0), 0);

  // Problemas mais comuns
  const problemasCount = cars.reduce((acc, car) => {
    if (!acc[car.problema]) acc[car.problema] = 0;
    acc[car.problema]++;
    return acc;
  }, {});
  const problemasOrdenados = Object.entries(problemasCount)
    .sort((a, b) => b[1] - a[1]); // do mais comum para o menos

  // Top 3 carros com mais problemas
  const carrosCount = cars.reduce((acc, car) => {
    const key = `${car.nome} (${car.ano})`;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {});
  const top3CarrosProblema = Object.entries(carrosCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Ano que mais apareceu na tabela
  const anoCount = cars.reduce((acc, car) => {
    if (!acc[car.ano]) acc[car.ano] = 0;
    acc[car.ano]++;
    return acc;
  }, {});
  const anoMaisFrequente = Object.entries(anoCount)
    .sort((a, b) => b[1] - a[1])[0];

  // Renderiza linhas da tabela
  const renderRow = ({ item, index }) => (
    <View style={[styles.row, { backgroundColor: index % 2 === 0 ? '#1F3A62' : '#26547C' }]}>
      <Text style={styles.cell}>{item.nome}</Text>
      <Text style={styles.cell}>{item.modelo}</Text>
      <Text style={styles.cell}>{item.ano}</Text>
      <Text style={styles.cell}>{item.problema}</Text>
      <Text style={styles.cell}>R$ {item.custo}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Cards */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total de Carros</Text>
        <Text style={styles.cardValue}>{totalCarros}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Custo Total</Text>
        <Text style={styles.cardValue}>R$ {custoTotal}</Text>
      </View>

      {/* Resumos */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Problemas mais comuns:</Text>
        {problemasOrdenados.map(([problema, qtd], index) => (
          <Text key={index} style={styles.summaryItem}>
            {problema} ({qtd}x)
          </Text>
        ))}

        <Text style={[styles.summaryTitle, { marginTop: 10 }]}>Top 3 carros com mais problemas:</Text>
        {top3CarrosProblema.length > 0 ? (
          top3CarrosProblema.map(([nome, qtd], index) => (
            <Text key={index} style={styles.summaryItem}>
              {nome} ({qtd}x)
            </Text>
          ))
        ) : (
          <Text style={styles.summaryItem}>Nenhum carro cadastrado</Text>
        )}

        <Text style={[styles.summaryTitle, { marginTop: 10 }]}>Ano que mais apareceu:</Text>
        {anoMaisFrequente ? (
          <Text style={styles.summaryItem}>
            {anoMaisFrequente[0]} ({anoMaisFrequente[1]}x)
          </Text>
        ) : (
          <Text style={styles.summaryItem}>Nenhum carro cadastrado</Text>
        )}
      </View>

      {/* Tabela */}
      <View style={styles.tableWrapper}>
        <ScrollView horizontal contentContainerStyle={{ paddingTop: 10, justifyContent: 'center' }}>
          <View>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell]}>Nome</Text>
              <Text style={[styles.cell, styles.headerCell]}>Modelo</Text>
              <Text style={[styles.cell, styles.headerCell]}>Ano</Text>
              <Text style={[styles.cell, styles.headerCell]}>Problema</Text>
              <Text style={[styles.cell, styles.headerCell]}>Custo</Text>
            </View>
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRow}
            />
          </View>
        </ScrollView>
      </View>

      {/* Botão voltar */}
      <TouchableOpacity style={styles.botaoVoltar} onPress={() => router.push('/cadastro')}>
        <Text style={styles.textoBotao}>← Voltar para Cadastro</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#003C71', 
    padding: 10,
  },
  card: { 
    backgroundColor: '#0061A8', 
    paddingVertical: 20, 
    paddingHorizontal: 15, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardTitle: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    marginBottom: 5, 
    textAlign: 'center',
  },
  cardValue: { 
    color: '#FFFFFF', 
    fontSize: 22, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  summary: { 
    marginBottom: 20, 
    alignItems: 'center', 
  },
  summaryTitle: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center',
  },
  summaryItem: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    marginTop: 2,
    textAlign: 'center',
  },
  tableWrapper: { 
    alignItems: 'center', 
    marginBottom: 20,
  },
  row: { 
    flexDirection: 'row', 
    borderBottomWidth: 1, 
    borderBottomColor: '#0061A8' 
  },
  headerRow: { 
    backgroundColor: '#0061A8' 
  },
  cell: { 
    padding: 10, 
    minWidth: 100, 
    textAlign: 'center', 
    color: '#FFFFFF', 
    fontSize: 16 
  },
  headerCell: { 
    fontWeight: 'bold' 
  },
  botaoVoltar: { 
    backgroundColor: '#0061A8', 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 8, 
    alignSelf: 'center',
    marginBottom: 20,
  },
  textoBotao: { 
    color: '#FFFFFF', 
    fontWeight: 'bold', 
    fontSize: 16,
  },
});