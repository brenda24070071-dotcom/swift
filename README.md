# 🛒 SwiftCart E-commerce

Plataforma de e-commerce especializada em **hardware e periféricos** para entusiastas de tecnologia, gamers e montadores de PC.

---

## ✅ Funcionalidades (Sprint 1)

- Cadastro de usuários com preenchimento automático de endereço via **ViaCEP**
- Autenticação com JWT (login/logout)
- CRUD completo de **Produtos** (Admin)
- CRUD completo de **Categorias** (Admin)
- Gestão de **Carrinho de Compras** (Cliente)
- **Wishlist** (favoritos)
- Checkout simulado
- 15 Casos de Uso documentados e implementados
- Testes unitários (Jest), integração (Supertest) e E2E (Cypress)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Observação |
|--------|-----------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS | Interface interativa |
| Backend | Node.js 18 + Express + Prisma ORM | API REST |
| Banco de Dados | **SQLite** (arquivo local) | **Sem instalação ou Docker** |
| API Externa | ViaCEP | Preenchimento automático de endereço |
| Testes Unit/Int | Jest + Supertest | Backend |
| Testes E2E | Cypress | Frontend |

> 💡 **Por que SQLite?**
> O banco de dados é um arquivo `dev.db` criado automaticamente pelo Prisma.
> Não é necessário instalar PostgreSQL, MySQL ou Docker.

---

## 📦 Pré-requisitos

| Ferramenta | Versão mínima | Verificar |
|-----------|--------------|-----------|
| **Node.js** | 18.x | `node -v` |
| **npm** | 9.x | `npm -v` |
| Git | qualquer | `git --version` |


---

## ⚙️ Instalação e Execução

### Passo 1 — Clone o repositório

```bash
git clone https://github.com/seu-usuario/swiftcart.git
cd swiftcart
```

### Passo 2 — Configure e inicialize o backend

```bash
cd backend

# Copia o arquivo de variáveis de ambiente
cp .env.example .env

# Instala dependências, cria o banco SQLite e popula dados iniciais
npm run setup
```

O comando `npm run setup` executa automaticamente:
1. `npm install` — instala todas as dependências
2. `npx prisma migrate dev --name init` — cria o arquivo `dev.db` e todas as tabelas
3. `node scripts/seed.js` — popula categorias, produtos e usuários demo

### Passo 3 — Configure e inicialize o frontend

```bash
# Em outro terminal, a partir da raiz do projeto
cd frontend
cp .env.example .env
npm install
```

### Passo 4 — Execute os servidores

```bash
# Terminal 1 — Backend (dentro de backend/)
npm run dev

# Terminal 2 — Frontend (dentro de frontend/)
npm run dev
```

### Acessos

| Serviço | URL |
|---------|-----|
| 🌐 Frontend | http://localhost:5173 |
| 🔧 Backend API | http://localhost:3000 |
| ❤️ Health check | http://localhost:3000/health |

### Credenciais demo (criadas pelo seed)

| Perfil | E-mail | Senha |
|--------|--------|-------|
| **Admin** | admin@swiftcart.dev | Admin@123 |
| **Cliente** | cliente@swiftcart.dev | Cliente@123 |

---

## 🧪 Executando os Testes

### Backend — Unitários e Integração

```bash
cd backend

# Copia e configura .env (se ainda não fez)
cp .env.example .env

# Todos os testes
npm test

# Com relatório de cobertura (gera HTML em backend/coverage/)
npm run test:coverage
```

> ⚠️ Os testes de integração usam o mesmo banco `dev.db` e limpam apenas os registros de teste (e-mails com `@test-swiftcart`).

### Frontend — E2E com Cypress

```bash
cd frontend

# Interface gráfica (recomendado para apresentação)
npx cypress open

# Modo headless (CI/linha de comando)
npx cypress run
```

> ⚠️ O backend precisa estar rodando (`npm run dev`) antes de executar os testes E2E.

---

## 🗂️ Estrutura de Pastas

```
swiftcart/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma       # Modelo do banco (SQLite)
│   ├── src/
│   │   ├── controllers/        # Lógica de negócio (UC01–UC15)
│   │   ├── middlewares/        # JWT, roles, tratamento de erros
│   │   ├── models/             # Prisma Client
│   │   ├── routes/             # Endpoints REST
│   │   ├── services/           # ViaCEP, validação, e-mail
│   │   └── utils/              # Helpers (slug, formatação)
│   ├── tests/
│   │   ├── unit/               # Jest — funções isoladas
│   │   └── integration/        # Supertest — rotas + banco
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── cypress/
│   │   ├── e2e/                # Testes E2E (auth, catálogo, checkout)
│   │   └── support/            # Comandos customizados
│   ├── src/
│   │   ├── components/         # UI reutilizável + Layout
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── hooks/              # useAuth, useCart, useCep
│   │   ├── pages/              # 8 telas (Home, Login, Register...)
│   │   ├── services/           # Chamadas à API
│   │   └── utils/              # Formatação, validadores
│   ├── .env.example
│   └── package.json
├── docs/
│   ├── casos_de_uso.md         # 15 UCs documentados
│   ├── justificativa_stack.md  # Justificativa tecnológica
│   ├── database/
│   │   ├── schema.sql          # Schema SQL de referência
│   │   └── MER.md              # Modelo entidade-relacionamento
│   └── api/
│       └── SwiftCart_Postman_Collection.json
├── scripts/
│   ├── seed.js                 # Dados iniciais
│   └── reset-db.sh             # Reinicia banco
└── README.md
```

---

## 🔗 API Externa — ViaCEP

Ao digitar um CEP no cadastro ou no perfil, o sistema consulta automaticamente `https://viacep.com.br/ws/{cep}/json/` e preenche logradouro, bairro, cidade e UF. A integração é não-bloqueante: se o CEP for inválido ou o serviço estiver indisponível, o usuário pode preencher o endereço manualmente.

---

## 🤝 Comandos Úteis

```bash
# Resetar banco e repopular (backend/)
npm run db:reset

# Abrir Prisma Studio — interface visual do banco
npm run db:studio

# Ver todas as rotas disponíveis
curl http://localhost:3000/health
```

---


---

## 📄 Licença

Projeto acadêmico distribuído sob licença **MIT**.
