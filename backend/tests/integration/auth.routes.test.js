// backend/tests/integration/auth.routes.test.js
/**
 * Testes de integração — rotas de autenticação.
 * Usa banco SQLite de teste separado (arquivo temporário).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const request  = require('supertest');
const app      = require('../../src/app');
const prisma   = require('../../src/models');

beforeAll(async () => {
  await prisma.usuario.deleteMany({ where: { email: { contains: '@test-swiftcart' } } });
});

afterAll(async () => {
  await prisma.usuario.deleteMany({ where: { email: { contains: '@test-swiftcart' } } });
  await prisma.$disconnect();
});

describe('POST /api/auth/register', () => {
  it('deve registrar um novo usuário com dados válidos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Usuário Teste', email: 'valido@test-swiftcart', senha: 'Senha@123' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('usuario');
    expect(res.body.usuario.email).toBe('valido@test-swiftcart');
    expect(res.body.usuario).not.toHaveProperty('senha');
  });

  it('deve retornar 409 para e-mail já cadastrado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Outro', email: 'valido@test-swiftcart', senha: 'Senha@123' });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('deve retornar 400 para senha fraca', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Teste', email: 'fraca@test-swiftcart', senha: '123456' });

    expect(res.status).toBe(400);
  });

  it('deve retornar 400 para e-mail inválido', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Teste', email: 'nao-e-email', senha: 'Senha@123' });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('deve autenticar e retornar JWT para credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'valido@test-swiftcart', senha: 'Senha@123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario.tipoAcesso).toBe('CLIENTE');
  });

  it('deve retornar 401 para senha incorreta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'valido@test-swiftcart', senha: 'SenhaErrada@1' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Credenciais inválidas.');
  });

  it('deve retornar 401 para e-mail não cadastrado', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inexistente@test-swiftcart', senha: 'Qualquer@1' });

    expect(res.status).toBe(401);
  });
});
