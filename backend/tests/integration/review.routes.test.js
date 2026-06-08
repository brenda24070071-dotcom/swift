// backend/tests/integration/review.routes.test.js
/**
 * Testes de integração — CRUD de Avaliações (rating 1–5).
 * Integração REAL com SQLite: as asserções leem o estado persistido.
 * Mutar a nota diretamente no banco DEVE alterar a média retornada pela API.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const bcrypt  = require('bcryptjs');
const request = require('supertest');
const app     = require('../../src/app');
const prisma  = require('../../src/models');

const MARK = '@test-swiftcart.dev';
const SENHA = 'Senha@123';

let produto;            // produto de teste
let clienteToken;       // dono das avaliações
let outroToken;         // outro cliente (testa 403)
let adminToken;         // admin (testa exclusão por admin)
let clienteId;

async function criarUsuario(nome, email, tipoAcesso) {
  return prisma.usuario.create({
    data: { nome, email, senha: await bcrypt.hash(SENHA, 10), tipoAcesso },
  });
}

async function login(email) {
  const res = await request(app).post('/api/auth/login').send({ email, senha: SENHA });
  return res.body.token;
}

async function cleanup() {
  await prisma.avaliacao.deleteMany({ where: { produto: { nome: { contains: '[TEST-REVIEW]' } } } });
  await prisma.produto.deleteMany({ where: { nome: { contains: '[TEST-REVIEW]' } } });
  await prisma.usuario.deleteMany({ where: { email: { contains: '@test-swiftcart' } } });
}

beforeAll(async () => {
  await cleanup();

  produto = await prisma.produto.create({
    data: { nome: '[TEST-REVIEW] Mousepad XL', preco: 99.9, estoque: 50 },
  });

  const cliente = await criarUsuario('Cliente Review', `rev-cliente${MARK}`, 'CLIENTE');
  clienteId = cliente.id;
  await criarUsuario('Outro Cliente', `rev-outro${MARK}`, 'CLIENTE');
  await criarUsuario('Admin Review', `rev-admin${MARK}`, 'ADMIN');

  clienteToken = await login(`rev-cliente${MARK}`);
  outroToken   = await login(`rev-outro${MARK}`);
  adminToken   = await login(`rev-admin${MARK}`);
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

const auth = (t) => ({ Authorization: `Bearer ${t}` });

describe('POST /api/products/:id/reviews', () => {
  it('exige autenticação (401 sem token)', async () => {
    const res = await request(app)
      .post(`/api/products/${produto.id}/reviews`)
      .send({ nota: 5 });
    expect(res.status).toBe(401);
  });

  it('rejeita nota fora do intervalo 1–5 (400) e NÃO persiste', async () => {
    const res = await request(app)
      .post(`/api/products/${produto.id}/reviews`)
      .set(auth(clienteToken))
      .send({ nota: 6, comentario: 'inválida' });
    expect(res.status).toBe(400);

    const count = await prisma.avaliacao.count({ where: { idProduto: produto.id } });
    expect(count).toBe(0);
  });

  it('retorna 404 para produto inexistente', async () => {
    const res = await request(app)
      .post('/api/products/99999999/reviews')
      .set(auth(clienteToken))
      .send({ nota: 4 });
    expect(res.status).toBe(404);
  });

  it('cria avaliação válida (201) e persiste no banco', async () => {
    const res = await request(app)
      .post(`/api/products/${produto.id}/reviews`)
      .set(auth(clienteToken))
      .send({ nota: 4, comentario: 'Muito bom' });

    expect(res.status).toBe(201);
    expect(res.body.nota).toBe(4);
    expect(res.body.usuario).toHaveProperty('nome');

    const persisted = await prisma.avaliacao.findUnique({ where: { id: res.body.id } });
    expect(persisted).not.toBeNull();
    expect(persisted.nota).toBe(4);
    expect(persisted.idUsuario).toBe(clienteId);
  });

  it('impede avaliação duplicada do mesmo usuário (409)', async () => {
    const res = await request(app)
      .post(`/api/products/${produto.id}/reviews`)
      .set(auth(clienteToken))
      .send({ nota: 2 });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/products/:id/reviews — média reflete o estado real', () => {
  it('lista a avaliação e calcula a média', async () => {
    // segundo cliente avalia com nota 2 → média (4+2)/2 = 3
    await request(app)
      .post(`/api/products/${produto.id}/reviews`)
      .set(auth(outroToken))
      .send({ nota: 2, comentario: 'Ok' });

    const res = await request(app).get(`/api/products/${produto.id}/reviews`);
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.media).toBe(3);
    expect(res.body.data).toHaveLength(2);
  });

  it('ANTIFRAGIL: mutar a nota direto no banco muda a média da API', async () => {
    // Força todas as notas deste produto para 5 → média deve virar 5.
    await prisma.avaliacao.updateMany({
      where: { idProduto: produto.id },
      data:  { nota: 5 },
    });

    const res = await request(app).get(`/api/products/${produto.id}/reviews`);
    expect(res.body.media).toBe(5);

    // E o endpoint do produto também reflete isso.
    const prod = await request(app).get(`/api/products/${produto.id}`);
    expect(prod.body.media).toBe(5);
    expect(prod.body.totalAvaliacoes).toBe(2);
  });

  it('a listagem de produtos anexa média e total de avaliações', async () => {
    const res = await request(app).get('/api/products?search=[TEST-REVIEW]&limit=50');
    const item = res.body.data.find((p) => p.id === produto.id);
    expect(item).toBeDefined();
    expect(item.media).toBe(5);
    expect(item.totalAvaliacoes).toBe(2);
  });
});

describe('PUT /api/reviews/:id', () => {
  let reviewId;

  beforeAll(async () => {
    const r = await prisma.avaliacao.findFirst({
      where: { idProduto: produto.id, idUsuario: clienteId },
    });
    reviewId = r.id;
  });

  it('impede edição por quem não é o dono (403)', async () => {
    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set(auth(outroToken))
      .send({ nota: 1 });
    expect(res.status).toBe(403);

    const unchanged = await prisma.avaliacao.findUnique({ where: { id: reviewId } });
    expect(unchanged.nota).toBe(5); // permaneceu 5 (do teste anterior)
  });

  it('permite o dono atualizar a nota (200) e persiste', async () => {
    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set(auth(clienteToken))
      .send({ nota: 1, comentario: 'Mudei de ideia' });
    expect(res.status).toBe(200);
    expect(res.body.nota).toBe(1);

    const persisted = await prisma.avaliacao.findUnique({ where: { id: reviewId } });
    expect(persisted.nota).toBe(1);
    expect(persisted.comentario).toBe('Mudei de ideia');
  });

  it('rejeita atualização com nota inválida (400)', async () => {
    const res = await request(app)
      .put(`/api/reviews/${reviewId}`)
      .set(auth(clienteToken))
      .send({ nota: 99 });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/reviews/:id', () => {
  it('impede exclusão por usuário sem permissão (403)', async () => {
    const review = await prisma.avaliacao.findFirst({
      where: { idProduto: produto.id, idUsuario: clienteId },
    });
    const res = await request(app)
      .delete(`/api/reviews/${review.id}`)
      .set(auth(outroToken));
    expect(res.status).toBe(403);

    const still = await prisma.avaliacao.findUnique({ where: { id: review.id } });
    expect(still).not.toBeNull();
  });

  it('permite o ADMIN excluir qualquer avaliação (200) e remove do banco', async () => {
    const review = await prisma.avaliacao.findFirst({
      where: { idProduto: produto.id, idUsuario: clienteId },
    });
    const res = await request(app)
      .delete(`/api/reviews/${review.id}`)
      .set(auth(adminToken));
    expect(res.status).toBe(200);

    const gone = await prisma.avaliacao.findUnique({ where: { id: review.id } });
    expect(gone).toBeNull();
  });
});

describe('Cascade — excluir produto remove suas avaliações', () => {
  it('remove avaliações órfãs ao excluir o produto', async () => {
    await prisma.produto.delete({ where: { id: produto.id } });
    const restantes = await prisma.avaliacao.count({ where: { idProduto: produto.id } });
    expect(restantes).toBe(0);
  });
});
