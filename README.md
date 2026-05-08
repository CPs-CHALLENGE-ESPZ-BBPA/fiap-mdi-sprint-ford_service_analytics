# Ford Service Analytics

Aplicativo móvel desenvolvido com **Expo + React Native** para gerenciamento de registros de oficina Ford e análise de dados de manutenção em tempo real.

---

## Integrantes

| Nome | RM |
|------|----|
| Albert Katri | RM556544 |
| Bruno Carneiro Leão | RM555563 |
| Bruno Biletsky | RM554739 |
| Paulo Akira Okama | RM556840 |

---

## Sobre o Projeto

O sistema permite que analistas Ford registrem veículos que passaram pela oficina, acompanhem problemas recorrentes e analisem custos de manutenção. A partir dos dados coletados é possível identificar padrões de falha por modelo e ano, orientando ações de pós-venda para aumentar o VIN Share.

---

## Funcionalidades

### Login
- Autenticação de usuário com validação de campos
- **Persistência de sessão** via AsyncStorage — o usuário permanece logado entre sessões
- Redirecionamento automático para o cadastro quando já existe sessão ativa
- **Notificação local** ao realizar login com sucesso
- Botão de logout disponível na tela de registros

### Cadastro de Veículo
- Formulário com 5 campos: nome, modelo, ano, problema e custo
- **Validação avançada de inputs**: ano entre 1900 e o ano atual, custo positivo, aceita vírgula como separador decimal
- `maxLength` em todos os campos para evitar entradas excessivas
- **Verificação de conectividade** antes de enviar dados (expo-network)
- `KeyboardAvoidingView` — formulário não fica escondido pelo teclado em nenhuma plataforma
- Envio via POST para a API com feedback via Alert
- **Notificação local** ao cadastrar veículo com sucesso, exibindo o nome do veículo

### Dashboard de Registros
- **KPI cards**: total de veículos, custo total e ticket médio (formatados em "mil" / "mi")
- **Gráfico de barras** (react-native-chart-kit) dos 5 problemas mais frequentes
- Fallback para web: barras proporcionais via `View` (sem SVG)
- Top 3 modelos com mais ocorrências (medalhas ouro/prata/bronze)
- Ano mais frequente nos registros
- Tabela completa com scroll horizontal e linhas alternadas
- **Cache offline**: dados salvos no AsyncStorage após cada fetch; se sem internet, exibe última versão em cache com banner de aviso
- **Notificação local** ao carregar dados do cache (modo offline)
- Botão "Sair" que encerra a sessão e retorna ao login

---

## Stack de Tecnologias

| Tecnologia | Versão | Uso |
|-----------|--------|-----|
| Expo | 55.0.9 | Runtime e toolchain |
| React Native | 0.83.2 | Framework mobile |
| Expo Router | 55.0.8 | Navegação file-based (Stack) |
| AsyncStorage | 2.2.0 | Persistência local (sessão + cache offline) |
| expo-notifications | 55.x | Notificações locais |
| expo-network | 55.0.9 | Verificação de conectividade |
| react-native-chart-kit | 6.12.0 | Gráfico de barras |
| react-native-svg | 15.15.4 | Renderização dos gráficos |
| json-server | 0.17.4 | API REST mock |

---

## Estrutura do Projeto

```
ford-service-analytics/
├── app/
│   ├── _layout.js       → Stack Navigator + handler de notificações
│   ├── index.js         → Tela de Login + verificação de sessão
│   ├── cadastro.js      → Formulário de cadastro de veículos
│   └── registros.js     → Dashboard com gráficos e análises
├── assets/
│   └── ford-logo.png    → Logo Ford
├── db.json              → Banco de dados fake (json-server)
└── package.json
```

### Fluxo de Navegação

```
Login (index.js)
  │
  ├── Sessão existente → replace para /cadastro (automático)
  └── Login válido    → replace para /cadastro
                            │
                            └── Ver Registros → /registros
                                                    │
                                                    └── Sair → replace para /
```

---

## Schema de Dados

```json
{
  "id": "string",
  "nome": "string (ex: Ford Ka)",
  "modelo": "string (ex: SE)",
  "ano": "number",
  "problema": "string (ex: Troca de óleo)",
  "custo": "number"
}
```

**Endpoint:** `GET /carros` · `POST /carros`

**URL base por plataforma:**
- Android (emulador): `http://10.0.2.2:3000`
- iOS / Web: `http://localhost:3000`

---

## Como Executar

### Pré-requisitos
- Node.js 18+
- Expo Go instalado no celular **ou** emulador Android/iOS configurado

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar a API (Terminal 1)
```bash
npm run api
# json-server rodando em http://localhost:3000
```

### 3. Iniciar o app (Terminal 2)
```bash
npm start          # Menu interativo com QR Code
npm run android    # Emulador Android direto
npm run ios        # Simulador iOS (somente Mac)
npm run web        # Navegador
```

### Credenciais de teste
```
E-mail: a
Senha:  a
```

---

## Design System Ford

| Elemento | Cor | Aplicação |
|----------|-----|-----------|
| Azul primário | `#0061A8` | Headers, botões principais |
| Fundo principal | `#001E3C` | Background de todas as telas |
| Cards / inputs | `#002B5C` | Superfícies elevadas |
| Acento | `#4A9FE0` | Ícones, valores de destaque |
| Texto secundário | `#8FBAD8` | Labels, subtítulos |
| Bordas | `#1A4A7A` | Separadores e bordas de input |
| Branco | `#FFFFFF` | Textos principais |
