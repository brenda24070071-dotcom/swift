# Justificativa da Stack Tecnológica — SwiftCart

## Tema: E-commerce de Hardware & Periféricos

---

## Backend: Node.js + Express + Prisma ORM

**Justificativa:**
- **Node.js** oferece alta performance para APIs I/O-bound com ecossistema npm maduro.
- **Express** é minimalista e flexível, com estrutura clara de rotas, middlewares e controllers.
- **Prisma ORM** entrega type-safety, migrações versionadas e queries legíveis. Suporta SQLite, PostgreSQL e MySQL com a mesma interface, facilitando migração futura para produção.

---

## Frontend: React + Vite + Tailwind CSS

**Justificativa:**
- **React 18** com Hooks simplifica gerenciamento de estado local e é o framework mais adotado no mercado.
- **Vite** oferece builds rápidos e HMR instantâneo.
- **Tailwind CSS** permite prototipagem rápida com consistência visual.

---

## Banco de Dados: SQLite (via Prisma)

**Justificativa:**
- **SQLite** é um banco de dados embutido, sem instalação de servidor, sem Docker, sem configuração de rede.
- O arquivo `dev.db` é criado automaticamente pelo Prisma na primeira migração (`npx prisma migrate dev`).
- Suporta transações ACID completas — essencial para o fluxo de checkout (criar pedido + limpar carrinho atomicamente).
- **Adequado para o escopo acadêmico:** toda a equipe consegue rodar o projeto com um único `npm install`, independentemente do sistema operacional.
- **Migração futura:** basta alterar `provider = "postgresql"` no `schema.prisma` e ajustar a `DATABASE_URL` para migrar para PostgreSQL em produção.

**Alternativas consideradas:**
- PostgreSQL com Docker: exige Docker instalado e configurado, com alto consumo de HD e memória — inviável para o contexto da equipe.
- MongoDB: não adequado para relacionamentos fortes (Usuários → Pedidos → Itens → Produtos).

---

## Testes

| Nível | Ferramenta | Justificativa |
|-------|-----------|---------------|
| Unitários | **Jest** | Padrão do ecossistema Node.js, mocks nativos |
| Integração | **Supertest** | Testa rotas Express sem subir servidor real |
| E2E | **Cypress** | Interface gráfica para debug, comandos customizados |

---

## API Externa: ViaCEP

**URL:** `https://viacep.com.br/ws/{cep}/json/`
**Tipo:** Pública, sem autenticação, gratuita.

**Justificativa:**
O cadastro e a edição de perfil exigem endereço. A ViaCEP preenche automaticamente logradouro, bairro, cidade e UF a partir do CEP, reduzindo erros de digitação e melhorando a experiência do usuário. Demonstra integração com serviço externo conforme exigido pelo enunciado.

**Tratamento de falhas:**
- Timeout de 5s na requisição.
- CEP inválido → usuário preenche manualmente (fluxo não-bloqueante).
- Cache em memória (TTL 5 min) no backend para evitar requisições repetidas.

---

## Segurança

- Senhas com **bcrypt** (cost 10).
- Autenticação via **JWT** (expiração: 7 dias).
- **CORS** restrito à origem do frontend.
- Validação de entrada com **Joi** em todos os endpoints críticos.
- Mensagens genéricas em autenticação (não revela qual campo é inválido).
- `.env` nunca versionado.
