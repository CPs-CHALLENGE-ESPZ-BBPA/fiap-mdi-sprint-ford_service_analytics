import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, ScrollView, StyleSheet,
  TouchableOpacity, Platform, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { loadSession, clearSession } from './utils/auth';
import { checkRateLimit } from './utils/rateLimiter';
import { logger } from './utils/logger';
import { hasPermission, ROLE_LABELS, ROLE_COLORS } from './utils/rbac';
import { encryptData, decryptData } from './utils/crypto';
import { BarChart } from 'react-native-chart-kit';
import * as Notifications from 'expo-notifications';

const notify = async (title, body) => {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({ content: { title, body, ...(Platform.OS === 'android' && { channelId: 'default' }) }, trigger: null });
  } catch (_) {}
};

const API_URL = Platform.select({
  android: 'http://10.0.2.2:3000',
  ios: 'http://localhost:3000',
  web: 'http://localhost:3000',
});

const chartConfig = {
  backgroundColor: '#001A38',
  backgroundGradientFrom: '#001A38',
  backgroundGradientTo: '#002B5C',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(74, 159, 224, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(143, 186, 216, ${opacity})`,
  barPercentage: 0.6,
  propsForBackgroundLines: { stroke: '#1A3A5C', strokeDasharray: '' },
};

export default function Registros() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [cars, setCars] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);

  useEffect(() => { fetchCars(); }, []);
  useEffect(() => {
    loadSession().then(s => {
      if (!s) {
        logger.warn('ACESSO_NAO_AUTORIZADO', { route: '/registros' });
        router.replace('/');
        return;
      }
      logger.info('DASHBOARD_ACCESS', { role: s.role });
      setRole(s.role || 'user');
    });
  }, []);

  // Reads carsCache (encrypted in current format; falls back to plaintext for legacy cache)
  const readCarsCache = async () => {
    const cached = await AsyncStorage.getItem('carsCache');
    if (!cached) return null;
    try { return JSON.parse(decryptData(cached)); }
    catch { try { return JSON.parse(cached); } catch { return null; } }
  };

  const fetchCars = async () => {
    if (!checkRateLimit('api_read')) return;
    setLoading(true);
    try {
      const networkState = await Network.getNetworkStateAsync();
      const connected = networkState.isConnected ?? true;
      setIsOnline(connected);

      if (!connected) {
        const cached = await readCarsCache();
        if (cached) {
          setCars(cached);
          await notify('Modo offline', 'Sem conexão — exibindo dados salvos em cache.');
        }
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/carros`);
      const data = await response.json();
      setCars(data);
      await AsyncStorage.setItem('carsCache', encryptData(JSON.stringify(data)));
      await AsyncStorage.setItem('carsCacheTimestamp', Date.now().toString());
    } catch {
      try {
        const cached = await readCarsCache();
        if (cached) setCars(cached);
      } catch (_) {}
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await clearSession();
    router.replace('/');
  };

  // ── Analytics ───────────────────────────────────────────────────────────
  const totalCarros = cars.length;
  const custoTotal = cars.reduce((acc, c) => acc + (c.custo || 0), 0);
  const custoMedio = totalCarros > 0 ? custoTotal / totalCarros : 0;

  const problemasCount = cars.reduce((acc, c) => {
    acc[c.problema] = (acc[c.problema] || 0) + 1;
    return acc;
  }, {});
  const problemasOrdenados = Object.entries(problemasCount).sort((a, b) => b[1] - a[1]);

  const carrosCount = cars.reduce((acc, c) => {
    const key = `${c.nome} (${c.ano})`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const top3 = Object.entries(carrosCount).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const anoCount = cars.reduce((acc, c) => {
    acc[c.ano] = (acc[c.ano] || 0) + 1;
    return acc;
  }, {});
  const anoMaisFrequente = Object.entries(anoCount).sort((a, b) => b[1] - a[1])[0];

  const chartProblemas = problemasOrdenados.slice(0, 5);
  const chartData = {
    labels: chartProblemas.map(([p]) => (p.length > 9 ? p.substring(0, 9) + '…' : p)),
    datasets: [{ data: chartProblemas.length > 0 ? chartProblemas.map(([, q]) => q) : [0] }],
  };

  // ── Render ──────────────────────────────────────────────────────────────
  const COLUMNS = [
    { key: 'placa',    header: 'Placa',    width: 90  },
    { key: 'nome',     header: 'Nome',     width: 140 },
    { key: 'modelo',   header: 'Modelo',   width: 100 },
    { key: 'ano',      header: 'Ano',      width: 65  },
    { key: 'problema', header: 'Problema', width: 190, wrap: true },
    { key: 'custo',    header: 'Custo',    width: 95  },
  ];

  const fmtCusto = (v = 0) =>
    v >= 1000000 ? `R$${(v / 1000000).toFixed(1).replace('.', ',')} mi`
    : v >= 1000  ? `R$${(v / 1000).toFixed(0)} mil`
    : `R$${v.toFixed(0)}`;

  const renderRow = ({ item, index }) => (
    <View style={[styles.row, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
      {COLUMNS.map(col => (
        <Text
          key={col.key}
          style={[styles.cell, col.key === 'custo' && styles.cellCusto, { width: col.width }]}
          {...(!col.wrap && { numberOfLines: 1, ellipsizeMode: 'tail' })}
        >
          {col.key === 'custo' ? fmtCusto(item.custo) : String(item[col.key] ?? '')}
        </Text>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A9FE0" />
        <Text style={styles.loadingText}>Carregando registros...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: insets.bottom + 16 }} showsVerticalScrollIndicator={false}>

      {/* Role badge */}
      {role && (
        <View style={[styles.roleBadge, { borderColor: ROLE_COLORS[role] }]}>
          <Ionicons name="shield-checkmark-outline" size={12} color={ROLE_COLORS[role]} />
          <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
        </View>
      )}

      {/* Banner offline */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={15} color="#FFFFFF" />
          <Text style={styles.offlineText}>Sem conexão — exibindo dados em cache</Text>
        </View>
      )}

      {/* KPI cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { marginRight: 6 }]}>
          <View style={styles.kpiIconBox}>
            <Ionicons name="car-sport-outline" size={20} color="#4A9FE0" />
          </View>
          <Text style={styles.kpiValue}>{totalCarros}</Text>
          <Text style={styles.kpiLabel}>Veículos</Text>
        </View>
        <View style={[styles.kpiCard, { marginHorizontal: 6 }]}>
          <View style={styles.kpiIconBox}>
            <Ionicons name="cash-outline" size={20} color="#4A9FE0" />
          </View>
          <Text style={styles.kpiValue}>
            {custoTotal >= 1000000
              ? `R$${(custoTotal / 1000000).toFixed(1).replace('.', ',')} mi`
              : custoTotal >= 1000
              ? `R$${(custoTotal / 1000).toFixed(0)} mil`
              : `R$${custoTotal.toFixed(0)}`}
          </Text>
          <Text style={styles.kpiLabel}>Custo Total</Text>
        </View>
        <View style={[styles.kpiCard, { marginLeft: 6 }]}>
          <View style={styles.kpiIconBox}>
            <Ionicons name="trending-up-outline" size={20} color="#4A9FE0" />
          </View>
          <Text style={styles.kpiValue}>
            {custoMedio >= 1000000
              ? `R$${(custoMedio / 1000000).toFixed(1).replace('.', ',')} mi`
              : custoMedio >= 1000
              ? `R$${(custoMedio / 1000).toFixed(0)} mil`
              : `R$${custoMedio.toFixed(0)}`}
          </Text>
          <Text style={styles.kpiLabel}>Ticket Médio</Text>
        </View>
      </View>

      {/* Gráfico */}
      {chartProblemas.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bar-chart-outline" size={17} color="#4A9FE0" />
            <Text style={styles.cardTitle}>Problemas Mais Frequentes</Text>
          </View>

          {Platform.OS !== 'web' ? (
            <BarChart
              data={chartData}
              width={screenWidth - 64}
              height={185}
              fromZero
              chartConfig={chartConfig}
              style={{ borderRadius: 10, marginTop: 4 }}
              showValuesOnTopOfBars
            />
          ) : (
            <View style={styles.chartFallback}>
              {chartProblemas.map(([problema, qtd], i) => (
                <View key={i} style={styles.chartFallbackRow}>
                  <Text style={styles.chartFallbackLabel} numberOfLines={1}>{problema}</Text>
                  <View style={[styles.chartFallbackBar, { flex: qtd }]} />
                  <Text style={styles.chartFallbackQtd}>{qtd}x</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Analytics — restrito a analyst e admin */}
      {hasPermission(role, 'view_analytics') ? (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trophy-outline" size={17} color="#4A9FE0" />
            <Text style={styles.cardTitle}>Análise de Registros</Text>
          </View>

          <Text style={styles.analyticSection}>Top 3 modelos com mais ocorrências</Text>
          {top3.length > 0 ? top3.map(([nome, qtd], i) => (
            <View key={i} style={styles.analyticRow}>
              <View style={[
                styles.rankBadge,
                i === 0 && styles.rankGold,
                i === 1 && styles.rankSilver,
                i === 2 && styles.rankBronze,
              ]}>
                <Text style={styles.rankText}>{i + 1}</Text>
              </View>
              <Text style={styles.analyticName} numberOfLines={1}>{nome}</Text>
              <Text style={styles.analyticQtd}>{qtd}x</Text>
            </View>
          )) : <Text style={styles.emptyText}>Nenhum registro encontrado</Text>}

          <View style={styles.divider} />

          <View style={styles.analyticRow}>
            <Ionicons name="calendar-outline" size={15} color="#4A9FE0" style={{ marginRight: 10 }} />
            <Text style={[styles.analyticName, { color: '#8FBAD8' }]}>Ano mais frequente</Text>
            <Text style={styles.analyticQtd}>
              {anoMaisFrequente ? `${anoMaisFrequente[0]} (${anoMaisFrequente[1]}x)` : '—'}
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="lock-closed-outline" size={17} color="#8FBAD8" />
            <Text style={styles.cardTitle}>Análise de Registros</Text>
          </View>
          <View style={styles.accessRestricted}>
            <Ionicons name="shield-outline" size={26} color="#E0A85A" />
            <Text style={styles.accessRestrictedText}>Acesso restrito a Analistas e Administradores</Text>
          </View>
        </View>
      )}

      {/* Tabela */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="list-outline" size={17} color="#4A9FE0" />
          <Text style={styles.cardTitle}>Todos os Registros</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={[styles.row, styles.headerRow]}>
              {COLUMNS.map(col => (
                <Text key={col.key} style={[styles.cell, styles.headerCell, { width: col.width }]} numberOfLines={1}>
                  {col.header}
                </Text>
              ))}
            </View>
            <FlatList
              data={cars}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderRow}
              scrollEnabled={false}
            />
          </View>
        </ScrollView>
      </View>

      {/* Botões de ação */}
      <TouchableOpacity
        style={[styles.botao, styles.botaoFidelidade]}
        onPress={() => router.push('/fidelidade')}
        activeOpacity={0.85}
      >
        <Ionicons name="ribbon-outline" size={18} color="#FFFFFF" />
        <Text style={styles.textoBotao}>Programa de Fidelidade</Text>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.botao, { flex: 1, marginRight: 8 }]}
          onPress={() => router.push('/cadastro')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFFFFF" />
          <Text style={styles.textoBotao}>Cadastro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.botaoSair, { flex: 1, marginLeft: 8 }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
          <Text style={styles.textoBotao}>Sair</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001E3C',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#001E3C',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  loadingText: { color: '#8FBAD8', fontSize: 14 },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B1F1F',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  offlineText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },

  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-end',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#001A38', marginBottom: 10,
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  accessRestricted: { alignItems: 'center', paddingVertical: 20, gap: 10 },
  accessRestrictedText: { color: '#8FBAD8', fontSize: 13, textAlign: 'center' },

  // KPI
  kpiRow: { flexDirection: 'row', marginBottom: 14 },
  kpiCard: {
    flex: 1,
    backgroundColor: '#002B5C',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A4A7A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  kpiIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#0D3A6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  kpiValue: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
  kpiLabel: { color: '#8FBAD8', fontSize: 10, marginTop: 3, textAlign: 'center', letterSpacing: 0.5 },

  // Cards genéricos
  card: {
    backgroundColor: '#002B5C',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1A4A7A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A3A5C',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },

  // Chart fallback (web)
  chartFallback: { width: '100%', marginTop: 4 },
  chartFallbackRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chartFallbackLabel: { color: '#8FBAD8', fontSize: 12, width: 120 },
  chartFallbackBar: { height: 14, backgroundColor: '#0061A8', borderRadius: 4, marginHorizontal: 8, minWidth: 10 },
  chartFallbackQtd: { color: '#4A9FE0', fontSize: 12, fontWeight: 'bold', width: 28, textAlign: 'right' },

  // Analytics
  analyticSection: {
    color: '#8FBAD8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  analyticRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#1A4A7A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankGold:   { backgroundColor: '#7A5800' },
  rankSilver: { backgroundColor: '#3A4A5A' },
  rankBronze: { backgroundColor: '#5A3A1A' },
  rankText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  analyticName: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  analyticQtd: { color: '#4A9FE0', fontSize: 13, fontWeight: 'bold' },
  emptyText: { color: '#8FBAD8', fontSize: 14, textAlign: 'center', paddingVertical: 10 },
  divider: { height: 1, backgroundColor: '#1A3A5C', marginVertical: 12 },

  // Tabela
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#1A3A5C' },
  headerRow: { backgroundColor: '#001A38' },
  rowEven: { backgroundColor: '#002447' },
  rowOdd: { backgroundColor: '#002B5C' },
  cell: { paddingVertical: 10, paddingHorizontal: 8, textAlign: 'center', color: '#FFFFFF', fontSize: 13, textAlignVertical: 'top' },
  headerCell: {
    color: '#8FBAD8',
    fontWeight: '700',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cellCusto: { color: '#4A9FE0', fontWeight: '600' },

  // Botões
  botaoFidelidade: { marginBottom: 10, backgroundColor: '#1A5A2A', borderWidth: 1, borderColor: '#2A7A3A', elevation: 4, shadowColor: '#1A5A2A' },
  actionsRow: { flexDirection: 'row', marginBottom: 32 },
  botao: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0061A8',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 7,
    elevation: 4,
    shadowColor: '#0061A8',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  botaoSair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5A1A1A',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: '#8B2020',
  },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
