// backend/tests/integration/auth.routes.test.js
/**
 * Testes de integração — rotas de autenticação.
 * Integração REAL com o banco SQLite (sem mocks de Prisma):
 * cada asserção reflete o estado persistido. Mutar o estado do banco
 * (ex.: trocar o hash da senha) deve quebrar o fluxo de login.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const bcrypt   = require('bcryptjs');
const request  = require('supertest');
const app      = require('../../src/app');
const prisma   = require('../../src/models');

// Sufixo de teste — o e-mail PRECISA ser válido (domínio com TLD), por isso `.dev`.
// O filtro de limpeza usa `contains: '@test-swiftcart'`, que continua casando.
const EMAIL  = 'valido@test-swiftcart.dev';
const SENHA  = 'Senha@123';

const cleanup = () =>
  prisma.usuario.deleteMany({ where: { email: { contains: '@test-swiftcart' } } });

beforeAll(cleanup);

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('deve registrar um novo usuário e persistir hash (nunca a senha em texto)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Usuário Teste', email: EMAIL, senha: SENHA });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.email).toBe(EMAIL);
    expect(res.body.usuario).not.toHaveProperty('senha');

    // Verifica o estado REAL no banco: a senha foi gravada como hash bcrypt.
    const persisted = await prisma.usuario.findUnique({ where: { email: EMAIL } });
    expect(persisted).not.toBeNull();
    expect(persisted.senha).not.toBe(SENHA);
    expect(await bcrypt.compare(SENHA, persisted.senha)).toBe(true);
  });

  it('deve retornar 409 para e-mail já cadastrado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Outro', email: EMAIL, senha: SENHA });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('deve retornar 400 para senha fraca', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Teste', email: 'fraca@test-swiftcart.dev', senha: '123456' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 para e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Teste', email: 'nao-e-email', senha: SENHA });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('deve autenticar e retornar JWT para credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, senha: SENHA });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.tipoAcesso).toBe('CLIENTE');
  });

  it('deve retornar 401 para senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, senha: 'SenhaErrada@1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas.');
  });

  it('deve retornar 401 para e-mail não cadastrado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistente@test-swiftcart.dev', senha: 'Qualquer@1' });

    expect(res.status).toBe(401);
  });

  /**
   * ANTIFRAGILIDADE: o teste lê o estado REAL do banco.
   * Ao reescrever o hash da senha diretamente no DB, a credencial antiga
   * DEVE deixar de funcionar (401) e a nova DEVE funcionar (200).
   * Se alguém substituir o login por um mock fixo, este teste quebra.
   */
  it('deve refletir mutação direta da senha no banco (estado real, não mock)', async () => {
    const NOVA_SENHA = 'NovaSenha@456';
    await prisma.usuario.update({
      where: { email: EMAIL },
      data:  { senha: await bcrypt.hash(NOVA_SENHA, 10) },
    });

    const antiga = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, senha: SENHA });
    expect(antiga.status).toBe(401); // a senha antiga não vale mais

    const nova = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL, senha: NOVA_SENHA });
    expect(nova.status).toBe(200);
    expect(nova.body).toHaveProperty('token');
  });
});
