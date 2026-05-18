import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loadSession, clearSession } from './utils/auth';
import { logger } from './utils/logger';
import { ROLE_LABELS, ROLE_COLORS, hasPermission } from './utils/rbac';

const MENU_ITEMS = [
  { key: 'cadastrar', icon: 'car-sport-outline',  title: 'Cadastrar', subtitle: 'Registrar novo veículo',   route: '/cadastro' },
  { key: 'fidelidade', icon: 'ribbon-outline', title: 'Fidelidade', subtitle: 'Programa de fidelidade', route: '/fidelidade' },
  { key: 'dashboard', icon: 'bar-chart-outline',   title: 'Dashboard', subtitle: 'Análise e relatórios',    route: '/registros', permission: 'view_dashboard' },
  { key: 'sair',      icon: 'log-out-outline',     title: 'Sair',      subtitle: 'Encerrar sessão',         danger: true },
];

export default function Menu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [session, setSession] = useState(null);

  useEffect(() => {
    loadSession().then(s => {
      if (!s) { router.replace('/'); return; }
      setSession(s);
    });
  }, []);

  const handleLogout = async () => {
    logger.audit('LOGOUT', { role: session?.role });
    await clearSession();
    router.replace('/');
  };

  const handlePress = (item) => {
    if (item.danger) { handleLogout(); return; }
    if (item.permission && !hasPermission(session?.role, item.permission)) return;
    router.push(item.route);
  };

  if (!session) return <View style={styles.container} />;

  const { nome, role } = session;
  const primeiroNome = nome ? nome.split(' ')[0] : 'Usuário';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
    >
      {/* Header do usuário */}
      <View style={styles.header}>
        <View style={styles.avatarBox}>
          <Ionicons name="person-outline" size={30} color="#4A9FE0" />
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.greeting}>Bem-vindo(a),</Text>
          <Text style={styles.userName} numberOfLines={1}>{primeiroNome}</Text>
        </View>
        {role && (
          <View style={[styles.roleBadge, { borderColor: ROLE_COLORS[role] }]}>
            <Ionicons name="shield-checkmark-outline" size={11} color={ROLE_COLORS[role]} />
            <Text style={[styles.roleBadgeText, { color: ROLE_COLORS[role] }]}>{ROLE_LABELS[role]}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>MENU PRINCIPAL</Text>

      {/* Grid 2x2 */}
      <View style={styles.grid}>
        {MENU_ITEMS.map(item => {
          const locked = !!(item.permission && !hasPermission(role, item.permission));
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.card, item.danger && styles.cardDanger, locked && styles.cardLocked]}
              onPress={() => handlePress(item)}
              activeOpacity={locked ? 1 : 0.75}
              disabled={locked}
            >
              <View style={[styles.cardIconBox, item.danger && styles.cardIconBoxDanger, locked && styles.cardIconBoxLocked]}>
                <Ionicons
                  name={locked ? 'lock-closed-outline' : item.icon}
                  size={26}
                  color={locked ? '#2A4A6A' : item.danger ? '#E05A5A' : '#4A9FE0'}
                />
              </View>
              <Text style={[styles.cardTitle, item.danger && styles.cardTitleDanger, locked && styles.cardTitleLocked]}>
                {item.title}
              </Text>
              <Text style={[styles.cardSubtitle, locked && styles.cardSubtitleLocked]}>
                {locked ? 'Restrito a Analistas' : item.subtitle}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.footer}>Ford Motor Company © 2026</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#001E3C' },
  content: { paddingHorizontal: 20 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#002B5C', borderRadius: 18, padding: 18,
    marginBottom: 28, borderWidth: 1, borderColor: '#1A4A7A',
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
  },
  avatarBox: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#001A38',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1A4A7A',
  },
  greeting: { fontSize: 13, color: '#8FBAD8', marginBottom: 2 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
    backgroundColor: '#001A38',
  },
  roleBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  sectionLabel: { fontSize: 11, color: '#4A9FE0', fontWeight: '700', letterSpacing: 2, marginBottom: 16 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 32 },
  card: {
    width: '47%', backgroundColor: '#002B5C', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: '#1A4A7A',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2, shadowRadius: 6, alignItems: 'flex-start',
  },
  cardDanger:  { borderColor: '#5A1A1A', backgroundColor: '#1A0808' },
  cardLocked:  { opacity: 0.4 },

  cardIconBox: {
    width: 48, height: 48, borderRadius: 13, backgroundColor: '#001A38',
    alignItems: 'center', justifyContent: 'center', marginBottom: 14,
    borderWidth: 1, borderColor: '#1A4A7A',
  },
  cardIconBoxDanger: { borderColor: '#5A1A1A', backgroundColor: '#1A0505' },
  cardIconBoxLocked: { borderColor: '#1A2A3A' },

  cardTitle:         { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 5 },
  cardTitleDanger:   { color: '#E05A5A' },
  cardTitleLocked:   { color: '#2A4A6A' },

  cardSubtitle:       { fontSize: 12, color: '#8FBAD8', lineHeight: 16 },
  cardSubtitleLocked: { color: '#1A3A5A' },

  footer: { textAlign: 'center', color: '#2A5A8A', fontSize: 12, letterSpacing: 0.5 },
});
