# Ford Service Analytics

Aplicativo mobile de gerenciamento de oficina Ford com análise de dados em tempo real, desenvolvido em **React Native + Expo** como parte do **Mobile Application Development Challenge** da FIAP.

---

## a) Sobre o Projeto

### O Desafio

O **Mobile Application Development Challenge** proposto pela Ford pede a criação de um aplicativo mobile funcional que apoie analistas da marca a **rastrear veículos atendidos na oficina, identificar problemas recorrentes e analisar custos de manutenção**, com foco em aumentar o VIN Share por meio de decisões orientadas a dados.

**Por que esse desafio foi escolhido?**
A área de pós-venda é estratégica para a Ford: cada veículo que retorna à oficina oficial representa uma oportunidade de fidelização. O time identificou que a falta de um sistema mobile ágil faz com que analistas percam padrões de falha que poderiam ser detectados rapidamente. O desafio mobile permitiu atacar esse problema real com uma solução end-to-end, desde o login seguro até dashboards analíticos.

---

### Funcionalidades Implementadas

#### Autenticação
- Login com validação de campos e feedback via toast animado
- Dois níveis de autenticação: credencial de demo (`a/a`) e usuários cadastrados via AsyncStorage
- Persistência de sessão — usuário permanece logado entre sessões
- Redirecionamento automático para o cadastro quando sessão já existe
- Notificação local ao realizar login com sucesso

#### Cadastro de Novo Usuário
- Tela dedicada (`/nova-conta`) para criação de conta
- Campos: Nome Completo, E-mail, Senha e Confirmação de Senha
- Validações: nome mínimo 2 caracteres, e-mail com regex, senha mínimo 6 caracteres, senhas coincidentes
- Verificação de e-mail duplicado no AsyncStorage antes de salvar
- Armazenamento no AsyncStorage com schema `{ nome, email, senha, criadoEm }`
- Toggle show/hide senha em ambos os campos de senha
- Feedback via toast animado para cada tipo de erro

#### Cadastro de Veículo
- Seleção de **Nome do Veículo** via integração com a **API FIPE** (fonte de dados externa obrigatória)
  - Lista de modelos Ford carregada automaticamente ao entrar na tela
  - Seleção de Ano de Fabricação carregada dinamicamente após escolher o modelo
  - Modal bottom-sheet com busca em tempo real por nome do modelo/ano
  - Badge "DADOS VIA API FIPE" indicando a origem dos dados
- Campos de texto: Modelo/Versão, Problema e Custo (R$)
- Validação completa: ano entre 1900 e ano atual, custo positivo, campos obrigatórios
- `maxLength` em todos os campos
- `KeyboardAvoidingView` para não ocultar o formulário pelo teclado
- Verificação de conectividade antes de enviar (expo-network)
- Envio via POST para a API REST mock
- Notificação local ao cadastrar veículo com sucesso
- Feedback detalhado via toast animado por campo inválido

#### Dashboard de Registros
- KPI cards: total de veículos, custo total e ticket médio (formatados em "mil"/"mi")
- Gráfico de barras dos 5 problemas mais frequentes (react-native-chart-kit + fallback web)
- Top 3 modelos com mais ocorrências (medalhas ouro/prata/bronze)
- Ano mais frequente nos registros
- Tabela completa com scroll horizontal e linhas alternadas
- Cache offline: dados salvos no AsyncStorage após cada fetch
- Modo offline com banner de aviso e notificação local
- Botão "Sair" que encerra sessão e retorna ao login

---

## b) Integrantes do Grupo

| Nome Completo | RM |
|---------------|----|
| Albert Katri | RM556544 |
| Bruno Carneiro Leão | RM555563 |
| Bruno Biletsky | RM554739 |
| Paulo Akira Okama | RM556840 |

---

## c) Como Rodar o Projeto

### Pré-requisitos

- **Node.js** 18 ou superior
- **Expo Go** instalado no celular **ou** emulador Android/iOS configurado
- Conexão com a internet (para carregar os modelos via API FIPE)

### Passo a passo

**1. Clonar o repositório**
```bash
git clone https://github.com/brnleao/challenge-1sem-3ano-mobile.git
cd challenge-1sem-3ano-mobile
```

**2. Instalar dependências**
```bash
npm install
```

**3. Iniciar a API mock (Terminal 1)**
```bash
npm run api
# json-server rodando em http://localhost:3000
```

**4. Iniciar o aplicativo (Terminal 2)**
```bash
npm start          # Menu interativo com QR Code
npm run android    # Emulador Android direto
npm run ios        # Simulador iOS (somente Mac)
npm run web        # Navegador
```

**5. Acessar o app**

| Plataforma | URL da API usada internamente |
|------------|-------------------------------|
| Android (emulador) | `http://10.0.2.2:3000` |
| iOS / Web | `http://localhost:3000` |

### Credenciais de teste (demo)
```
E-mail: a
Senha:  a
```
> Também é possível criar uma conta própria pela tela "Cadastre-se".

---

## d) Demonstração Visual

> **Atenção:** adicione os prints e o GIF/vídeo antes da entrega.
> README sem demonstração visual = -50% na nota de Documentação.

### Telas do Aplicativo

| Tela | Descrição |
|------|-----------|
| `screenshots/01-login.png` | Tela de login com campos de e-mail e senha |
| `screenshots/02-nova-conta.png` | Tela de criação de conta com validações |
| `screenshots/03-cadastro-fipe.png` | Seleção de veículo via modal FIPE |
| `screenshots/04-cadastro-form.png` | Formulário de cadastro preenchido |
| `screenshots/05-toast-sucesso.png` | Toast de confirmação após cadastro |
| `screenshots/06-toast-erro.png` | Toast de erro com motivo específico |
| `screenshots/07-dashboard-kpis.png` | Dashboard com KPI cards |
| `screenshots/08-dashboard-grafico.png` | Gráfico de barras dos problemas |
| `screenshots/09-dashboard-tabela.png` | Tabela completa de registros |

### Fluxo Principal

> Adicione aqui um GIF ou vídeo demonstrando o fluxo:
> Login → Cadastro de veículo (seleção FIPE) → Dashboard → Logout

```
[ GIF / vídeo aqui ]
```

---

## e) Decisões Técnicas

### Stack Escolhida

| Tecnologia | Versão | Justificativa |
|-----------|--------|---------------|
| **Expo** | 55.0.9 | Toolchain completo sem configuração nativa; suporte a iOS, Android e Web em um único projeto |
| **React Native** | 0.83.2 | Único framework que entrega código nativo real para as 3 plataformas com uma base JS/JSX |
| **Expo Router** | 55.0.8 | Roteamento file-based (inspirado no Next.js), elimina boilerplate de navegação |
| **AsyncStorage** | 2.2.0 | Persistência local sem servidor — ideal para sessão de usuário e cache offline |
| **expo-notifications** | 55.x | Notificações locais nativas sem dependência de push server |
| **expo-network** | 55.0.9 | Detecção de conectividade com uma linha, sem implementação manual |
| **react-native-chart-kit** | 6.12.0 | Gráficos prontos para React Native com suporte a SVG |
| **json-server** | 0.17.4 | API REST mock em segundos, sem backend real — perfeito para o escopo do challenge |
| **API FIPE** | pública | Fonte de dados real de veículos brasileiros; sem autenticação, gratuita, confiável |

### Estrutura do Projeto

```
ford-service-analytics/
├── app/
│   ├── _layout.js       → Stack Navigator (Expo Router) + handler de notificações
│   ├── index.js         → Tela de Login + verificação de sessão automática
│   ├── nova-conta.js    → Tela de criação de conta (AsyncStorage)
│   ├── cadastro.js      → Formulário de cadastro com integração FIPE
│   └── registros.js     → Dashboard analítico com gráficos e KPIs
├── assets/
│   └── ford-logo.png    → Logo Ford
├── db.json              → Banco de dados fake (json-server)
└── package.json
```

### Fluxo de Navegação

```
Login (index.js)
  │
  ├── Sessão existente ──────────────────────────────┐
  ├── Login a/a ou usuário cadastrado → /cadastro ◄──┘
  │                                         │
  ├── Não tem conta? → /nova-conta          └── Ver Registros → /registros
  │       │                                                          │
  │       └── Conta criada → voltar ao Login                        └── Sair → /
  └── Campos inválidos → toast de erro
```

### Integrações Realizadas

#### API FIPE (externa — obrigatória pelo challenge)
- **Endpoint base:** `https://parallelum.com.br/fipe/api/v1`
- **Marca Ford:** ID `22`
- **Fluxo:** ao entrar na tela de cadastro, busca todos os modelos Ford (`GET /carros/marcas/22/modelos`). Ao selecionar um modelo, busca os anos disponíveis (`GET /carros/marcas/22/modelos/{codigo}/anos`).
- **UX:** modal bottom-sheet com FlatList + campo de busca em tempo real (filter por `item.nome.toLowerCase().includes(query)`).

#### API REST mock (json-server)
- **Endpoint:** `GET /carros` e `POST /carros`
- **URL dinâmica por plataforma** via `Platform.select()` — Android usa `10.0.2.2` (redireciona do emulador para o host), iOS e Web usam `localhost`.

#### AsyncStorage
- **`@usuarios`** — array de usuários cadastrados pela tela nova-conta
- **`userSession`** — objeto com `{ email, nome, loggedAt }` para persistência de sessão
- **`@carrosCache`** — último snapshot de dados do dashboard para modo offline

### Decisões de Arquitetura

**Estado local (`useState`)** — sem Context API ou Redux. O escopo do app não justifica gerenciamento de estado global; cada tela é auto-suficiente.

**Toast animado no lugar de `Alert.alert`** — `Alert.alert` bloqueia a UI com um modal nativo que o usuário precisa dispensar. O toast usa `Animated.sequence` (slide from right + fade) com `pointerEvents="none"`, não interrompe o fluxo e auto-dismiss em ~3 segundos. É mais adequado para feedback não-crítico em apps modernos.

**Dois níveis de autenticação** — a credencial `a/a` é mantida intencionalmente como atalho para demonstração ao professor, sem impactar o fluxo real de criação e login de contas via AsyncStorage.

**Fetch nativo** — sem axios ou SWR. Fetch padrão do JavaScript é suficiente para as 2–3 chamadas que o app faz; adicionar uma biblioteca seria over-engineering para esse escopo.

---

## f) Próximos Passos

Com mais tempo, o grupo implementaria:

1. **Hash de senha** — atualmente a senha é salva em texto plano no AsyncStorage. Implementaríamos `expo-crypto` para gerar um SHA-256 antes de armazenar.

2. **Backend real** — substituir o json-server por uma API Node.js/Express com autenticação JWT, eliminando a dependência de localhost.

3. **Filtros e busca no dashboard** — filtrar registros por modelo, ano ou faixa de custo diretamente na tabela.

4. **Exportação de relatório** — gerar um PDF ou CSV dos registros para ser enviado por e-mail ao gerente da oficina.

5. **Foto do veículo** — integrar `expo-image-picker` para anexar foto do problema ao registro.

6. **Testes automatizados** — cobertura de testes unitários com Jest para as funções de validação e integração com a API FIPE.
