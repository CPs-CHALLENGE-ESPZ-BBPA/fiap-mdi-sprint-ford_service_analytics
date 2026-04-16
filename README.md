# App de Controle de Oficina (Expo)

## Integrantes
- Albert Katri — rm556544  
- Bruno Carneiro Leão — rm555563  
- Bruno Biletsky — rm554739  
- Paulo Akira Okama — rm556840  

---

## Resumo
Aplicativo móvel desenvolvido com **Expo + React Native** para gerenciamento de registros e criação de insights dos carros que visitaram a oficina FORD.

O sistema permite visualizar veículos, acompanhar problemas recorrentes e analisar custos de manutenção. A partir disso é possivel saber quais promoções e clientes que possam interessar para os donos de carro da marca. Ajudando ao analista ford acertar o público alvo e aumentar o VIN SHARE pós venda.

Funcionalidades principais:
- Listagem de carros cadastrados  
- Registro de problemas mecânicos  
- Indicadores de análise (problemas mais comuns, top carros, anos frequentes)  
- Integração com `json-server` (API fake)  
- Navegação com `expo-router`  

---

## Estrutura do projeto

- `app/` → telas e rotas (expo-router)
  - `index.js` → Tela de login
  - `cadastro.js` → Cadastro de registros
  - `registros.js` → Lista de carros registrados
  - `_layout.js` → estrutura de navegação

- `assets/` → imagens, ícones e splash  
- `db.json` → banco de dados fake (json-server)  
- `package.json` → dependências do projeto  

---

## Dados do sistema

O projeto utiliza um `json-server` com estrutura de carros, por exemplo:

- id
- nome do veículo
- modelo
- ano
- problema mecânico
- custo de manutenção

---

## Funcionalidades principais

- Visualização de veículos cadastrados  
- Cálculo de indicadores:
  - Problemas mais comuns
  - Top 3 carros com mais ocorrências
  - Ano mais frequente
- Análise de custos de manutenção  

---

## Como executar o projeto

### 1. Instalar dependências
npm install

### 2. Rodar API
npx json-server --watch db.json --port 3000 --host 0.0.0.0
