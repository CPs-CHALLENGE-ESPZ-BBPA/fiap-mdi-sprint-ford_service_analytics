# 📱 App de Presença (Expo)

# Integrantes do grupo

### Albert Katri - rm556544
### Bruno Carneiro Leão - rm555563
### Bruno Biletsky - rm554739
### Paulo Akira Okama - rm556840

# 📖 Resumo
Aplicativo móvel desenvolvido com Expo para registro de presença, incluindo:

- Presença  
- Login  
- Perfil  

Utiliza expo-router para navegação baseada em arquivos e valida presença via localização e Wi-Fi.

---

# 🧭 Navegação
O projeto utiliza roteamento baseado em arquivos.  
Cada arquivo dentro da pasta `app` vira automaticamente uma rota.

---

# 📱 Telas Principais

## 🏠 index.js
Tela inicial (Home) com informações e botão para iniciar presença.

## 🔐 login.js
Tela de login com autenticação de usuário e senha.

## 👤 profile.js
Tela de perfil do usuário com dados e opções da conta.

## 🧩 _layout.js
Configuração de layout e navegação compartilhada.

---

# ⚙️ Funcionalidades

## 🧠 Serviços Utilitários

### 📍 locationService.js
Responsável pela validação de presença via geolocalização.

### 📶 wifiService.js
Verifica se o usuário está conectado a um Wi-Fi autorizado.

---

## 🧩 Componentes Reutilizáveis

### 🔘 Button.js
Botão estilizado.

### ⏳ LoadingOverlay.js
Overlay de carregamento.

### 💬 Message.js
Exibição de mensagens e erros.

---

# 🗂️ Estrutura de Pastas

### app → telas e layout
### components → componentes reutilizáveis
### utils → serviços (localização, Wi-Fi)
### assets → ícones, imagens e splash
### index.js → entrada do app
### package.json → dependências
### app.json → configurações


---

# 🚀 Como Executar

## 💻 Instalar dependências

### npm install


## ▶️ Iniciar o projeto

### npx expo start


## 📱 Executar
- Expo Go (QR Code)  
- Emulador Android  
- Simulador iOS  

---

# ⚠️ Observações

- A navegação é automática (baseada em arquivos)  
- Para alterar ícones/splash, edite `assets` e `app.json`  
- Permissões de localização são necessárias  

---

# 🤝 Contribuição

Abra issues ou envie pull requests.  
Siga o padrão existente do projeto.

---

# 📄 Licença

Definida no package.json (ou adicionar conforme necessário).
