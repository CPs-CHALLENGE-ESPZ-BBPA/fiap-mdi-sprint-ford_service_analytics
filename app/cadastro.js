import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
  Modal, FlatList, ActivityIndicator, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Network from 'expo-network';
import * as Notifications from 'expo-notifications';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { sanitizeText, sanitizeApiParam, safeError } from './utils/security';

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

const FIPE_BASE = 'https://parallelum.com.br/fipe/api/v1';
const FORD_ID = '22';

const TEXT_FIELDS = [
  { key: 'modelo',   label: 'MODELO / VERSÃO',  placeholder: 'ex: SE 1.0',        icon: 'build-outline',   keyboard: 'default', max: 50  },
  { key: 'problema', label: 'PROBLEMA',          placeholder: 'ex: Troca de óleo', icon: 'warning-outline', keyboard: 'default', max: 100 },
];

const parseFipeValue = (str) => {
  const cleaned = (str || '').replace(/R\$\s?/, '').replace(/\./g, '').replace(',', '.');
  return parseFloat(cleaned);
};

const TOAST_ICONS = { success: 'checkmark-circle', error: 'close-circle', warning: 'alert-circle' };

export default function Cadastro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [values, setValues] = useState({ carro: '', modelo: '', ano: '', problema: '', custo: '' });
  const [focused, setFocused] = useState(null);
  const [errors, setErrors] = useState({});

  const [modelos, setModelos] = useState([]);
  const [anos, setAnos] = useState([]);
  const [loadingFipe, setLoadingFipe] = useState(false);
  const [selectedModelo, setSelectedModelo] = useState(null);
  const [selectedAno, setSelectedAno] = useState(null);
  const [modal, setModal] = useState({ visible: false, items: [], target: null, title: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [fipePrice, setFipePrice] = useState('');
  const [loadingPrice, setLoadingPrice] = useState(false);

  // Toast
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const toastAnim = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);

  const showToast = (message, type = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastAnim.setValue(0);
    setToast({ message, type });
    Animated.sequence([
      Animated.timing(toastAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2600),
      Animated.timing(toastAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };

  const toastTranslateX = toastAnim.interpolate({ inputRange: [0, 1], outputRange: [120, 0] });

  const setValue = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: false }));
  };

  useEffect(() => {
    const fetchModelos = async () => {
      setLoadingFipe(true);
      try {
        const res = await fetch(`${FIPE_BASE}/carros/marcas/${FORD_ID}/modelos`);
        const data = await res.json();
        setModelos(data.modelos || []);
      } catch (_) {
        showToast('Erro ao carregar modelos Ford. Verifique sua conexão.', 'warning');
      }
      setLoadingFipe(false);
    };
    fetchModelos();
  }, []);

  const openModal = (target) => {
    if (target === 'ano' && !selectedModelo) {
      showToast('Selecione o veículo Ford primeiro', 'warning');
      return;
    }
    setSearchQuery('');
    setModal({
      visible: true,
      items: target === 'modelo' ? modelos : anos,
      target,
      title: target === 'modelo' ? 'Selecionar Modelo Ford' : 'Selecionar Ano',
    });
  };

  const handleModalSelect = async (item) => {
    if (modal.target === 'modelo') {
      setSelectedModelo(item);
      setSelectedAno(null);
      setValue('carro', `Ford ${item.nome}`);
      setValue('ano', '');
      setValue('custo', '');
      setFipePrice('');
      setAnos([]);
      setSearchQuery('');
      setModal(prev => ({ ...prev, visible: false }));

      setLoadingFipe(true);
      try {
        const codigoSafe = sanitizeApiParam(String(item.codigo));
        const res = await fetch(`${FIPE_BASE}/carros/marcas/${FORD_ID}/modelos/${codigoSafe}/anos`);
        const data = await res.json();
        setAnos(data || []);
      } catch (_) {
        showToast('Erro ao carregar anos. Tente novamente.', 'warning');
      }
      setLoadingFipe(false);
    } else {
      setSelectedAno(item);
      setValue('ano', item.codigo.split('-')[0]);
      setValue('custo', '');
      setFipePrice('');
      setSearchQuery('');
      setModal(prev => ({ ...prev, visible: false }));
    }
  };

  const buscarPrecoFipe = async () => {
    if (!selectedModelo || !selectedAno) return;
    setValue('custo', '');
    setFipePrice('');
    setLoadingPrice(true);
    try {
      const modeloCode = sanitizeApiParam(String(selectedModelo.codigo));
      const anoCode = sanitizeApiParam(String(selectedAno.codigo));
      const res = await fetch(`${FIPE_BASE}/carros/marcas/${FORD_ID}/modelos/${modeloCode}/anos/${anoCode}`);
      const data = await res.json();
      const valorStr = data.Valor || '';
      const numero = parseFipeValue(valorStr);
      setFipePrice(valorStr);
      if (!isNaN(numero) && numero > 0) {
        setValue('custo', String(Math.round(numero)));
      }
    } catch (_) {
      showToast('Não foi possível carregar o preço FIPE. Insira manualmente.', 'warning');
    }
    setLoadingPrice(false);
  };

  const validate = () => {
    if (!values.carro) {
      showToast('Selecione o veículo Ford na lista FIPE', 'error');
      setErrors(prev => ({ ...prev, carro: true }));
      return false;
    }
    if (!values.ano) {
      showToast('Selecione o ano do veículo', 'error');
      setErrors(prev => ({ ...prev, ano: true }));
      return false;
    }
    if (!values.modelo.trim() || values.modelo.trim().length < 2) {
      showToast('Informe o modelo ou versão (ex: SE 1.0)', 'error');
      setErrors(prev => ({ ...prev, modelo: true }));
      return false;
    }
    if (!values.problema.trim() || values.problema.trim().length < 3) {
      showToast('Descreva o problema do veículo (mín. 3 caracteres)', 'error');
      setErrors(prev => ({ ...prev, problema: true }));
      return false;
    }
    if (!values.custo.trim()) {
      showToast('Informe o custo do serviço', 'error');
      setErrors(prev => ({ ...prev, custo: true }));
      return false;
    }
    const custoNum = parseFloat(values.custo.trim().replace(',', '.'));
    if (isNaN(custoNum) || custoNum <= 0) {
      showToast('Custo inválido — informe um valor positivo (ex: 350000)', 'error');
      setErrors(prev => ({ ...prev, custo: true }));
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!validate()) return;

    const custoNum = parseFloat(values.custo.trim().replace(',', '.'));
    const anoNum = parseInt(values.ano.trim(), 10);

    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) {
        showToast('Sem conexão com a internet. Verifique e tente novamente.', 'error');
        return;
      }
    } catch (_) {}

    try {
      const response = await fetch(`${API_URL}/carros`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: sanitizeText(values.carro.trim()),
          modelo: sanitizeText(values.modelo.trim()),
          ano: anoNum,
          problema: sanitizeText(values.problema.trim()),
          custo: custoNum,
        }),
      });

      if (response.ok) {
        await notify('Veículo cadastrado! 🚗', `${values.carro.trim()} foi adicionado ao sistema.`);
        showToast(`${values.carro.trim()} cadastrado com sucesso!`, 'success');
        setValues({ carro: '', modelo: '', ano: '', problema: '', custo: '' });
        setSelectedModelo(null);
        setSelectedAno(null);
        setAnos([]);
        setFipePrice('');
      } else {
        showToast(safeError('save'), 'error');
      }
    } catch {
      showToast('Sem resposta do servidor. Verifique se a API está rodando.', 'error');
    }
  };

  const isLoadingModelos = loadingFipe && modelos.length === 0;
  const isLoadingAnos   = loadingFipe && selectedModelo && anos.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        {/* Cabeçalho */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconBox}>
            <Ionicons name="car-sport-outline" size={24} color="#4A9FE0" />
          </View>
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.sectionTitle}>Novo Registro</Text>
            <Text style={styles.sectionSubtitle}>Preencha os dados do veículo</Text>
          </View>
        </View>

        {/* Card FIPE */}
        <View style={styles.card}>
          <View style={styles.fipeTag}>
            <Ionicons name="globe-outline" size={12} color="#4A9FE0" />
            <Text style={styles.fipeTagText}>DADOS VIA API FIPE</Text>
          </View>

          {/* Seletor de Veículo */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Ionicons name="car-outline" size={13} color={errors.carro ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.carro && styles.labelError]}>VEÍCULO FORD</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.selectorBtn,
                values.carro ? styles.selectorBtnFilled : null,
                errors.carro ? styles.selectorBtnError : null,
              ]}
              onPress={() => openModal('modelo')}
              activeOpacity={0.8}
              disabled={isLoadingModelos}
            >
              <Text style={values.carro ? styles.selectorText : styles.selectorPlaceholder} numberOfLines={1}>
                {isLoadingModelos ? 'Carregando modelos...' : values.carro || 'Toque para selecionar o modelo'}
              </Text>
              {isLoadingModelos
                ? <ActivityIndicator size="small" color="#4A9FE0" />
                : <Ionicons name="chevron-down-outline" size={16} color="#4A9FE0" />}
            </TouchableOpacity>
          </View>

          {/* Seletor de Ano */}
          <View style={[styles.inputGroup, { marginBottom: values.carro && values.ano ? 14 : 0 }]}>
            <View style={styles.labelRow}>
              <Ionicons name="calendar-outline" size={13} color={errors.ano ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.ano && styles.labelError]}>ANO</Text>
            </View>
            <TouchableOpacity
              style={[
                styles.selectorBtn,
                values.ano ? styles.selectorBtnFilled : null,
                !selectedModelo ? styles.selectorBtnDisabled : null,
                errors.ano ? styles.selectorBtnError : null,
              ]}
              onPress={() => openModal('ano')}
              activeOpacity={0.8}
              disabled={!selectedModelo || isLoadingAnos}
            >
              <Text style={values.ano ? styles.selectorText : styles.selectorPlaceholder} numberOfLines={1}>
                {!selectedModelo
                  ? 'Selecione o modelo primeiro'
                  : isLoadingAnos
                  ? 'Carregando anos...'
                  : values.ano || 'Toque para selecionar o ano'}
              </Text>
              {isLoadingAnos
                ? <ActivityIndicator size="small" color="#4A9FE0" />
                : <Ionicons name="chevron-down-outline" size={16} color={selectedModelo ? '#4A9FE0' : '#2A4A6A'} />}
            </TouchableOpacity>
          </View>

          {/* Botão buscar preço FIPE — só aparece quando ambos os campos estão preenchidos */}
          {values.carro && values.ano ? (
            <TouchableOpacity
              style={[styles.fipeBtn, loadingPrice && styles.botaoDisabled]}
              onPress={buscarPrecoFipe}
              disabled={loadingPrice}
              activeOpacity={0.8}
            >
              {loadingPrice ? (
                <>
                  <ActivityIndicator size="small" color="#4A9FE0" />
                  <Text style={styles.fipeBtnText}>Consultando FIPE...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="pricetag-outline" size={14} color="#4A9FE0" />
                  <Text style={styles.fipeBtnText}>Buscar Preço Tabela FIPE</Text>
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Card campos de texto */}
        <View style={styles.card}>
          {TEXT_FIELDS.map(({ key, label, placeholder, icon, keyboard, max }) => (
            <View key={key} style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Ionicons name={icon} size={13} color={errors[key] ? '#E05A5A' : '#4A9FE0'} />
                <Text style={[styles.label, errors[key] && styles.labelError]}>{label}</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  focused === key && styles.inputFocused,
                  errors[key] && styles.inputError,
                ]}
                placeholder={placeholder}
                placeholderTextColor="#2A4A6A"
                keyboardType={keyboard}
                value={values[key]}
                onChangeText={val => setValue(key, val)}
                maxLength={max}
                onFocus={() => setFocused(key)}
                onBlur={() => setFocused(null)}
              />
            </View>
          ))}

          {/* Custo — pré-preenchido via FIPE */}
          <View style={[styles.inputGroup, { marginBottom: 0 }]}>
            <View style={styles.labelRow}>
              <Ionicons name="cash-outline" size={13} color={errors.custo ? '#E05A5A' : '#4A9FE0'} />
              <Text style={[styles.label, errors.custo && styles.labelError]}>VALOR TABELA FIPE (R$)</Text>
              {fipePrice ? (
                <View style={styles.fipeMiniTag}>
                  <Ionicons name="checkmark-circle-outline" size={10} color="#4AE07A" />
                  <Text style={styles.fipeMiniTagText}>FIPE</Text>
                </View>
              ) : null}
            </View>
            <TextInput
              style={[
                styles.input,
                focused === 'custo' && styles.inputFocused,
                errors.custo && styles.inputError,
                loadingPrice && styles.inputDisabled,
              ]}
              placeholder={loadingPrice ? 'Consultando tabela FIPE...' : 'ex: 45000'}
              placeholderTextColor="#2A4A6A"
              keyboardType="decimal-pad"
              value={values.custo}
              onChangeText={val => { setValue('custo', val); setFipePrice(''); }}
              maxLength={10}
              onFocus={() => setFocused('custo')}
              onBlur={() => setFocused(null)}
              editable={!loadingPrice}
            />
            {loadingPrice && (
              <View style={styles.fipePriceRow}>
                <ActivityIndicator size="small" color="#4A9FE0" />
                <Text style={styles.fipePriceText}>Consultando tabela FIPE...</Text>
              </View>
            )}
            {!!fipePrice && !loadingPrice && (
              <View style={styles.fipePriceRow}>
                <Ionicons name="pricetag-outline" size={13} color="#4AE07A" />
                <Text style={styles.fipePriceText}>
                  Tabela FIPE: <Text style={styles.fipePriceHighlight}>{fipePrice}</Text> — edite se necessário
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Botão primário */}
        <TouchableOpacity
          style={[styles.botaoPrimario, (loadingFipe || loadingPrice) && styles.botaoDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={loadingFipe || loadingPrice}
        >
          <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.textoBotao}>Cadastrar Veículo</Text>
        </TouchableOpacity>

        {/* Botão secundário */}
        <TouchableOpacity style={styles.botaoSecundario} onPress={() => router.push('/registros')} activeOpacity={0.85}>
          <Ionicons name="bar-chart-outline" size={20} color="#4A9FE0" />
          <Text style={styles.textoBotaoSec}>Ver Dashboard</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Modal FIPE */}
      <Modal
        visible={modal.visible}
        animationType="slide"
        transparent
        onRequestClose={() => setModal(prev => ({ ...prev, visible: false }))}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { paddingBottom: Math.max(insets.bottom + 16, 20) }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modal.title}</Text>
              <TouchableOpacity onPress={() => { setSearchQuery(''); setModal(prev => ({ ...prev, visible: false })); }}>
                <Ionicons name="close-circle-outline" size={26} color="#8FBAD8" />
              </TouchableOpacity>
            </View>

            <View style={styles.searchWrapper}>
              <Ionicons name="search-outline" size={16} color="#4A9FE0" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.searchInput}
                placeholder={modal.target === 'modelo' ? 'Buscar modelo...' : 'Buscar ano...'}
                placeholderTextColor="#2A4A6A"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
                maxLength={60}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-outline" size={18} color="#8FBAD8" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={modal.items.filter(item =>
                item.nome.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              keyExtractor={(item) => item.codigo.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => handleModalSelect(item)} activeOpacity={0.7}>
                  <Text style={styles.modalItemText}>{item.nome}</Text>
                  <Ionicons name="chevron-forward-outline" size={15} color="#2A4A6A" />
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.modalSeparator} />}
              ListEmptyComponent={() => (
                <View style={styles.emptySearch}>
                  <Ionicons name="search-outline" size={28} color="#2A4A6A" />
                  <Text style={styles.emptySearchText}>Nenhum resultado para "{searchQuery}"</Text>
                </View>
              )}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          </View>
        </View>
      </Modal>

      {/* Toast */}
      <Animated.View
        style={[
          styles.toast,
          toast.type === 'success' ? styles.toastSuccess
            : toast.type === 'error' ? styles.toastError
            : styles.toastWarning,
          { opacity: toastAnim, transform: [{ translateX: toastTranslateX }] },
        ]}
        pointerEvents="none"
      >
        <Ionicons name={TOAST_ICONS[toast.type]} size={18} color="#FFFFFF" />
        <Text style={styles.toastText}>{toast.message}</Text>
      </Animated.View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: { flex: 1, backgroundColor: '#001E3C' },
  container: { flexGrow: 1, backgroundColor: '#001E3C', padding: 20, paddingBottom: 40 },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 4 },
  sectionIconBox: {
    width: 50, height: 50, borderRadius: 14, backgroundColor: '#002B5C',
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1A4A7A',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  sectionSubtitle: { fontSize: 13, color: '#8FBAD8', marginTop: 2 },

  card: {
    backgroundColor: '#002B5C', borderRadius: 18, padding: 20,
    borderWidth: 1, borderColor: '#1A4A7A', marginBottom: 16,
    elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25, shadowRadius: 8,
  },
  fipeTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 16,
    alignSelf: 'flex-start', backgroundColor: '#001A38', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: '#1A4A7A',
  },
  fipeTagText: { color: '#4A9FE0', fontSize: 10, fontWeight: '700', letterSpacing: 1 },

  inputGroup: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 7 },
  label: { fontSize: 11, color: '#8FBAD8', fontWeight: '700', letterSpacing: 1.2 },
  labelError: { color: '#E05A5A' },

  input: {
    backgroundColor: '#001A38', color: '#FFFFFF', borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 15,
    borderWidth: 1, borderColor: '#1A4A7A',
  },
  inputFocused: { borderColor: '#4A9FE0' },
  inputError: { borderColor: '#E05A5A' },
  inputDisabled: { opacity: 0.5 },

  fipeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 7, backgroundColor: '#001A38', borderRadius: 10,
    paddingVertical: 12, borderWidth: 1, borderColor: '#1A4A7A',
  },
  fipeBtnText: { color: '#4A9FE0', fontSize: 13, fontWeight: '600' },

  fipeMiniTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#002A14', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 2,
    borderWidth: 1, borderColor: '#1A5A2A', marginLeft: 6,
  },
  fipeMiniTagText: { color: '#4AE07A', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  fipePriceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  fipePriceText: { color: '#8FBAD8', fontSize: 12, flex: 1 },
  fipePriceHighlight: { color: '#4AE07A', fontWeight: 'bold' },

  selectorBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#001A38', borderRadius: 10, paddingHorizontal: 14,
    height: 48, borderWidth: 1, borderColor: '#1A4A7A',
  },
  selectorBtnFilled: { borderColor: '#4A9FE0' },
  selectorBtnDisabled: { opacity: 0.45 },
  selectorBtnError: { borderColor: '#E05A5A' },
  selectorText: { color: '#FFFFFF', fontSize: 14, flex: 1, marginRight: 8 },
  selectorPlaceholder: { color: '#2A4A6A', fontSize: 14, flex: 1, marginRight: 8 },

  botaoPrimario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#0061A8', paddingVertical: 15, borderRadius: 12,
    gap: 8, marginBottom: 12, elevation: 6,
    shadowColor: '#0061A8', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45, shadowRadius: 8,
  },
  botaoDisabled: { opacity: 0.5 },
  botaoSecundario: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#1A4A7A', gap: 8,
  },
  textoBotao: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  textoBotaoSec: { color: '#4A9FE0', fontWeight: 'bold', fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContainer: {
    backgroundColor: '#002B5C', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '75%', borderWidth: 1, borderColor: '#1A4A7A',
  },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: '#1A3A5C',
  },
  modalTitle: { color: '#FFFFFF', fontSize: 17, fontWeight: 'bold' },
  searchWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#001A38', borderRadius: 10,
    borderWidth: 1, borderColor: '#1A4A7A',
    paddingHorizontal: 12, marginBottom: 12,
  },
  searchInput: { flex: 1, color: '#FFFFFF', fontSize: 14, height: 44 },
  emptySearch: { alignItems: 'center', paddingVertical: 28, gap: 10 },
  emptySearchText: { color: '#8FBAD8', fontSize: 14, textAlign: 'center' },
  modalItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 4,
  },
  modalItemText: { color: '#FFFFFF', fontSize: 14, flex: 1 },
  modalSeparator: { height: 1, backgroundColor: '#1A3A5C' },

  toast: {
    position: 'absolute',
    bottom: 28,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    maxWidth: '85%',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  toastSuccess: { backgroundColor: '#1A6B3A' },
  toastError:   { backgroundColor: '#7A1A1A' },
  toastWarning: { backgroundColor: '#6B4A00' },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', flex: 1 },
});
