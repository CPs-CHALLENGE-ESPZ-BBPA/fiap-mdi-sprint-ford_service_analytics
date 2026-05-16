# Ford Service Analytics

Aplicativo mobile para gerenciamento de pós-venda Ford, desenvolvido em **React Native + Expo** como solução para o **Desafio 02 — VIN Share** do Mobile Application Development Challenge da FIAP.

---

## a) Sobre o Projeto

**Desafio escolhido:** Desafio 02 — Impulsionando o VIN Share na América do Sul.

O VIN Share mede a porcentagem de veículos Ford que retornam à rede oficial para manutenção. O app ataca esse problema em três frentes: registra atendimentos para identificar padrões, analisa dados em tempo real para orientar decisões, e oferece um **programa de fidelidade com descontos progressivos** para incentivar o retorno do cliente à rede Ford — fechando o ciclo de retenção dentro da própria ferramenta do analista.

### Funcionalidades

| Tela | O que faz |
|------|-----------|
| **Login** | Autenticação com validação, sessão persistente via AsyncStorage, notificação local no login |
| **Criar Conta** | Cadastro de usuário com validação de e-mail, senha com confirmação e verificação de duplicatas |
| **Cadastro de Veículo** | Seleção de modelo e ano via **API FIPE** (modal com busca em tempo real), validação por campo, notificação ao cadastrar |
| **Dashboard** | KPIs (total, custo total, ticket médio), gráfico de barras dos 5 problemas mais frequentes, top 3 modelos, tabela completa com coluna de problema expansível, cache offline com banner |
| **Programa de Fidelidade** | Agendamento de retorno por cliente, **comparativo Ford vs. mercado**, desconto progressivo de 5% por visita (máximo 30%), notificação push 2 dias antes do agendamento, preview em tempo real do desconto |

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

**Pré-requisitos:** Node.js 18+, Expo Go no celular ou emulador configurado.

```bash
# 1. Clonar e instalar
git clone https://github.com/CPs-CHALLENGE-ESPZ-BBPA/fiap-mdi-sprint-ford_service_analytics.git
cd fiap-mdi-sprint-ford_service_analytics
npm install

# 2. Terminal 1 — API mock
npm run api

# 3. Terminal 2 — App
npm start        # QR Code para Expo Go
npm run android  # Emulador Android
npm run web      # Navegador
```

**Credenciais de teste:** e-mail `a` / senha `a`  
*(ou crie uma conta pela tela "Cadastre-se")*

---

## d) Demonstração Visual

> ⚠️ **Adicione os prints e o GIF/vídeo antes da entrega.**  
> README sem demonstração visual = **-50% automático** na nota de Documentação.

### Telas

| # | Arquivo | Tela |
|---|---------|------|
| 1 | `screenshots/01-login.png` | Login |
| 2 | `screenshots/02-nova-conta.png` | Criar conta |
| 3 | `screenshots/03-cadastro-fipe.png` | Modal de seleção FIPE |
| 4 | `screenshots/04-cadastro-form.png` | Formulário de cadastro |
| 5 | `screenshots/05-dashboard-kpis.png` | Dashboard — KPIs |
| 6 | `screenshots/06-dashboard-grafico.png` | Dashboard — gráfico |
| 7 | `screenshots/07-dashboard-tabela.png` | Dashboard — tabela |
| 8 | `screenshots/08-fidelidade-lista.png` | Programa de Fidelidade |
| 9 | `screenshots/09-fidelidade-form.png` | Agendamento de retorno |
| 10 | `screenshots/10-toast.png` | Toast de feedback |

### Fluxo Principal

> Adicione aqui um GIF ou vídeo do fluxo: Login → Cadastro (FIPE) → Dashboard → Fidelidade → Agendamento

```
[ GIF / vídeo aqui ]
```

---

## e) Decisões Técnicas

### Stack

| Tecnologia | Versão | Por quê |
|-----------|--------|---------|
| Expo | 55.0.9 | Toolchain completo, suporte iOS/Android/Web sem config nativa |
| React Native | 0.83.2 | Código nativo real para as 3 plataformas com base JS/JSX |
| Expo Router | 55.0.8 | Roteamento file-based, elimina boilerplate de navegação |
| AsyncStorage | 2.2.0 | Persistência local para sessão, usuários, cache e agendamentos |
| expo-notifications | 55.x | Notificações locais e agendadas sem push server |
| expo-network | 55.0.9 | Detecção de conectividade em uma linha |
| react-native-chart-kit | 6.12.0 | Gráfico de barras com SVG + fallback web via `View` |
| json-server | 0.17.4 | API REST mock para o escopo do challenge |
| API FIPE | pública | Dados reais de veículos Ford brasileiros, sem autenticação |

### Estrutura

```
app/
├── _layout.js      → Stack Navigator + handler de notificações
├── index.js        → Login + verificação de sessão
├── nova-conta.js   → Cadastro de usuário (AsyncStorage)
├── cadastro.js     → Cadastro de veículo + integração FIPE
├── registros.js    → Dashboard com analytics e cache offline
└── fidelidade.js   → Programa de fidelidade + agendamentos
assets/
└── ford-logo.png
db.json             → API mock (json-server)
```

### Fluxo de Navegação

```
Login (/)
 ├── Sessão existente → /cadastro (automático)
 ├── Login válido     → /cadastro
 │    └── Dashboard  → /registros
 │         ├── Fidelidade → /fidelidade
 │         └── Sair → /
 └── Sem conta? → /nova-conta → Login
```

### Integrações

**API FIPE** — `GET parallelum.com.br/fipe/api/v1/carros/marcas/22/modelos` carrega todos os modelos Ford ao abrir o cadastro. Ao selecionar um modelo, busca os anos (`/modelos/{codigo}/anos`). UX via modal bottom-sheet com FlatList + filtro em tempo real.

**json-server** — `GET /carros` e `POST /carros`. URL dinâmica via `Platform.select()`: Android emulador usa `10.0.2.2`, iOS/Web usam `localhost`.

**AsyncStorage** — 4 chaves: `userSession` (sessão), `@usuarios` (contas), `carsCache` (cache offline do dashboard), `@agendamentos` (retornos agendados no programa de fidelidade).

**expo-notifications** — notificações imediatas (login, cadastro, offline) e notificação futura agendada (2 dias antes do retorno marcado no programa de fidelidade). Notificação cancelada automaticamente ao remover o agendamento.

### Arquitetura

- **Estado local** (`useState`) por tela — sem Context/Redux. Cada tela é auto-suficiente e o escopo não justifica estado global.
- **Toast animado** no lugar de `Alert.alert` — slide from right + `pointerEvents="none"`, não bloqueia a UI e auto-dismiss em 3s.
- **Dois níveis de auth** — `a/a` como atalho de demo, AsyncStorage `@usuarios` para contas reais.
- **Programa de fidelidade** — desconto calculado como `min(visitas × 5%, 30%)`. Mercado estimado em 7% abaixo do preço Ford: a partir da 2ª visita o desconto supera essa diferença e a Ford fica mais barata que o mercado, mostrando o valor concreto de retornar à rede oficial.

---

## f) Próximos Passos

1. **Hash de senha** — salvar SHA-256 via `expo-crypto` ao invés de texto plano
2. **Backend real** — substituir json-server por API com autenticação JWT
3. **Vínculo fidelidade ↔ registros** — ao cadastrar um veículo, oferecer agendamento direto do retorno sem preencher dados novamente
4. **Filtros no dashboard** — filtrar tabela por modelo, ano ou faixa de custo
5. **Exportação** — gerar PDF/CSV dos registros para o gerente da oficina
