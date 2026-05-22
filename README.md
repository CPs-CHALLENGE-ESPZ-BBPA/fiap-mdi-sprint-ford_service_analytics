# Ford Service Analytics

Aplicativo mobile para gerenciamento de pós-venda Ford, desenvolvido em **React Native + Expo** como solução para o **Desafio 02 — VIN Share** do Mobile Application Development Challenge da FIAP.

---

## a) Sobre o Projeto

**Desafio escolhido:** Desafio 02 — Impulsionando o VIN Share na América do Sul.

O VIN Share mede a porcentagem de veículos Ford que retornam à rede oficial para manutenção. O app ataca esse problema em três frentes: registra atendimentos para identificar padrões, analisa dados em tempo real para orientar decisões, e oferece um **programa de fidelidade com descontos progressivos** para incentivar o retorno do cliente à rede Ford — fechando o ciclo de retenção dentro da própria ferramenta do analista.

### Funcionalidades

| Tela | O que faz |
|------|-----------|
| **Login** | Autenticação com validação, sessão persistente assinada (token + TTL de 8h) via AsyncStorage, notificação local no login |
| **Criar Conta** | Cadastro de usuário com validação de e-mail, senha com confirmação, verificação de duplicatas e escolha de tipo de conta (Usuário ou Admin com código de acesso) |
| **Menu Principal** | Hub de navegação pós-login com cards para Cadastrar, Fidelidade, Dashboard e Sair; itens fora do papel do usuário aparecem bloqueados via **RBAC** (admin, analista, usuário) |
| **Cadastro de Veículo** | Seleção de modelo e ano via **API FIPE** (modal com busca em tempo real), botão "Buscar Preço Tabela FIPE" pré-preenche o valor automaticamente após veículo e ano selecionados, **campo placa com formatação automática** (validando formato antigo `ABC-1234` e Mercosul `ABC-1D23`), validação por campo, notificação ao cadastrar |
| **Dashboard** | KPIs (total, custo total, ticket médio), gráfico de barras dos 5 problemas mais frequentes, top 3 modelos, **tabela completa com coluna Placa**, problema expansível, cache offline com banner; analytics restrito a Analistas/Admin |
| **Programa de Fidelidade** | Agendamento de retorno por cliente, **comparativo Ford vs. mercado**, desconto progressivo de 5% por visita (máximo 30%), notificação push 2 dias antes do agendamento, preview em tempo real do desconto, **histórico de visitas** com filtro Realizadas/Canceladas |

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

# 2. Terminal 1 — API mock (HTTPS com cert auto-assinado)
npm run api

# 3. Terminal 2 — App
npm start        # QR Code para Expo Go
npm run android  # Emulador Android
npm run web      # Navegador
```

**Credenciais de teste:** e-mail `a` / senha `a`  
*(ou crie uma conta pela tela "Cadastre-se")*

> 🔐 **API dual-stack — HTTP + HTTPS simultâneos:** o `npm run api` sobe a mesma API em duas portas: `http://localhost:3000` (usada pelo client em dev, sem fricção) e `https://localhost:3443` (TLS com cert auto-assinado gerado em `.certs/` no startup, demonstra o requisito de HTTPS do Cybersecurity Challenge). Toda a stack de middleware (CORS, rate limit, payload signing, audit, body size limit) se aplica a ambas as portas. Para verificar o TLS funcionando: `curl -k https://localhost:3443/carros`. Em produção, o cert auto-assinado seria substituído por um emitido por CA pública (Let's Encrypt) e o HTTP seria desligado.

---

## d) Demonstração Visual

### Telas

| # | Arquivo | Tela |
|---|---------|------|
| 1 | <img width="499" height="829" alt="image" src="https://github.com/user-attachments/assets/3ab8f0d1-cb74-4c09-9f06-5368a60e6a43" /> | Login |
| 2 | <img width="501" height="831" alt="image" src="https://github.com/user-attachments/assets/c0ab6054-b396-4988-a0ef-ce57a5f3ca67" /> | Criar conta |
| 3 | <img width="458" height="827" alt="image" src="https://github.com/user-attachments/assets/af7746a8-c6a0-4fe0-939d-61a38b9fb052" /> | Menu Principal |
| 4 | <img width="501" height="829" alt="image" src="https://github.com/user-attachments/assets/045ac55c-05e3-48f4-867e-4fd628772075" /> | Modal de seleção FIPE |
| 5 | <img width="351" height="689" alt="image" src="https://github.com/user-attachments/assets/a186fb09-75bb-496b-9a6b-6803a8594e54" /> | Formulário de cadastro |
| 6 | <img width="504" height="183" alt="image" src="https://github.com/user-attachments/assets/1623c753-a34d-4626-acc6-9bc1d369f6fa" /> | Dashboard — KPIs |
| 7 | <img width="492" height="467" alt="image" src="https://github.com/user-attachments/assets/8f485084-7ec9-4615-a243-99b36f0ea882" /> | Dashboard — detalhes |
| 8 | <img width="466" height="826" alt="image" src="https://github.com/user-attachments/assets/1010eba4-6bb8-4947-9875-cad9498c21ef" /> | Dashboard — tabela |
| 9 | <img width="500" height="829" alt="image" src="https://github.com/user-attachments/assets/fdca8bf1-72a9-419e-a06b-852248a56be7" /> | Programa de Fidelidade |
| 10 | <img width="501" height="829" alt="image" src="https://github.com/user-attachments/assets/7648fab6-e133-4a17-8c6e-f15bc283291a" /> | Agendamento de retorno |

### Fluxo Principal

> Vídeo do fluxo: Login → Cadastro (FIPE) → Dashboard → Fidelidade → Agendamento → Sair

```
https://github.com/user-attachments/assets/050c43da-6f8f-46fe-881f-c10dad0b322e
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
├── _layout.js      → Stack Navigator + handler de notificações + retention policy
├── index.js        → Login + verificação de sessão + brute force protection
├── nova-conta.js   → Cadastro de usuário (AsyncStorage criptografado)
├── menu.js         → Hub principal pós-login com RBAC
├── cadastro.js     → Cadastro de veículo + integração FIPE + placa
├── registros.js    → Dashboard com analytics e cache offline
├── fidelidade.js   → Programa de fidelidade + agendamentos criptografados
└── utils/
    ├── auth.js         → Token de sessão assinado (TTL 8h, renovação automática)
    ├── rbac.js         → 3 papéis (admin, analista, usuário) + matriz de permissões
    ├── security.js     → Sanitização XSS/SQLi, validações, anonimização, payload signing
    ├── crypto.js       → Hash de senha + cifra XOR-hex para dados em repouso
    ├── rateLimiter.js  → Janela deslizante por chave (api_read, api_write, fipe)
    ├── bruteForce.js   → 5 falhas → bloqueio de 15 min por e-mail
    ├── logger.js       → Logs estruturados com ring buffer (200) e sanitização automática
    └── retention.js    → Política de retenção de contas inativas (anonimizada)
assets/
├── ford-logo.png
└── fiap-logo.png
db.json              → API mock (json-server)
server.js            → Wrapper json-server com CORS + rate limit + auth + audit
```

### Fluxo de Navegação

```
Login (/)
 ├── Sessão válida → /menu (automático)
 ├── Login válido  → /menu
 │    ├── Cadastrar  → /cadastro → (opcional) /registros
 │    ├── Fidelidade → /fidelidade
 │    ├── Dashboard  → /registros → /fidelidade  (restrito a analyst/admin)
 │    └── Sair       → /
 └── Sem conta? → /nova-conta → Login
```

### Integrações

**API FIPE** — 3 endpoints encadeados: `GET /carros/marcas/22/modelos` carrega todos os modelos Ford ao abrir o cadastro; ao selecionar um modelo, busca os anos (`/modelos/{codigo}/anos`); com veículo e ano definidos, o botão "Buscar Preço Tabela FIPE" consulta o valor real (`/modelos/{codigo}/anos/{anoCodigo}`) e pré-preenche o campo de custo. UX via modal bottom-sheet com FlatList + filtro em tempo real.

**json-server** — `GET /carros` e `POST /carros` com middleware próprio (rate limit, payload signing e audit log). URL dinâmica via `Platform.select()`: Android emulador usa `10.0.2.2`, iOS/Web usam `localhost`.

**AsyncStorage** — 4 chaves principais: `userSession` (token assinado), `@usuarios` (contas, criptografado), `carsCache` (cache offline do dashboard), `@agendamentos` (retornos do programa de fidelidade, criptografado).

**expo-notifications** — notificações imediatas (login, cadastro, offline) e notificação futura agendada (2 dias antes do retorno marcado no programa de fidelidade). Notificação cancelada automaticamente ao remover o agendamento.

### Arquitetura

- **Estado local** (`useState`) por tela — sem Context/Redux. Cada tela é auto-suficiente e o escopo não justifica estado global.
- **Toast animado** no lugar de `Alert.alert` — slide from right + `pointerEvents="none"`, não bloqueia a UI e auto-dismiss em 3s.
- **Dois níveis de auth** — `a/a` como atalho de demo (papel admin), AsyncStorage `@usuarios` para contas reais (papel atribuído pelo formulário ou pelo domínio `@ford.com` → analista).
- **RBAC** — três papéis controlam o que aparece no menu, no cadastro e no dashboard via `hasPermission(role, action)` em `utils/rbac.js`.
- **Programa de fidelidade** — desconto calculado como `min(visitas × 5%, 30%)`. Mercado estimado em 7% abaixo do preço Ford: a partir da 2ª visita o desconto supera essa diferença e a Ford fica mais barata que o mercado, mostrando o valor concreto de retornar à rede oficial.
- **Segurança como diferencial** — TLS local (cert auto-assinado via `selfsigned`), hash de senha, criptografia em repouso (incluindo cache do dashboard), rate limit, brute force protection, sanitização, payload signing, body size limit (10kb), logs estruturados e trilha de auditoria (commits dedicados ao Cybersecurity Challenge — ver histórico do git).

---

## f) Próximos Passos

1. **Backend real** — substituir json-server por API com autenticação JWT e Postgres
2. **Vínculo fidelidade ↔ registros** — ao cadastrar um veículo, oferecer agendamento direto do retorno sem preencher dados novamente
3. **Filtros no dashboard** — filtrar tabela por modelo, ano, placa ou faixa de custo
4. **Exportação** — gerar PDF/CSV dos registros para o gerente da oficina
5. **Validação de placa via API externa** — consultar histórico do veículo pela placa antes do cadastro
6. **Painel de auditoria in-app** — visualizador dos logs estruturados gerados pelo `logger.js` para o papel admin
