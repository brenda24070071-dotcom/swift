// backend/scripts/seed.js — popula o banco SQLite com dados iniciais (mínimo 5 de cada tabela)
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco SQLite...\n');

  // Limpa o banco de dados antes de popular
  console.log('🧹 Limpando dados antigos...');
  await prisma.pedido.deleteMany({});
  await prisma.avaliacao.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.carrinhoItem.deleteMany({});
  await prisma.produto.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.categoria.deleteMany({});

  // Reseta os contadores de ID auto-increment no SQLite
  try {
    await prisma.$executeRawUnsafe(`DELETE FROM sqlite_sequence;`);
    console.log('🔄 Auto-increments resetados para 1.');
  } catch (err) {
    // Silencioso se der erro
  }

  // ── 1. Categorias (5 registros) ─────────────────────────────────────────
  const catsData = [
    { nome: 'Placas de Vídeo', slug: 'gpus' },
    { nome: 'Processadores',   slug: 'cpus' },
    { nome: 'Memórias RAM',    slug: 'ram' },
    { nome: 'SSDs e HDs',      slug: 'ssds' },
    { nome: 'Periféricos',     slug: 'perifericos' },
  ];

  const cats = [];
  for (const c of catsData) {
    const created = await prisma.categoria.create({ data: c });
    cats.push(created);
  }
  console.log(`✅ ${cats.length} categorias criadas.`);

  const [gpuCat, cpuCat, ramCat, ssdCat, periCat] = cats;

  // ── 2. Produtos (8 registros) ───────────────────────────────────────────
  const produtosData = [
    { nome: 'RTX 4070 Ti Super 16GB',            preco: 4799.99, estoque: 8,  idCategoria: gpuCat.id,  descricao: 'GPU NVIDIA Ada Lovelace, 16GB GDDR6X'      },
    { nome: 'RX 7800 XT 16GB',                   preco: 2999.00, estoque: 12, idCategoria: gpuCat.id,  descricao: 'GPU AMD RDNA 3, 16GB GDDR6'                },
    { nome: 'Ryzen 7 7800X3D',                   preco: 2199.90, estoque: 15, idCategoria: cpuCat.id,  descricao: 'Processador AM5 com 3D V-Cache, 8 cores'   },
    { nome: 'Intel Core i9-14900K',               preco: 3299.00, estoque: 7,  idCategoria: cpuCat.id,  descricao: '24 cores (8P+16E), socket LGA1700'         },
    { nome: 'Kingston Fury Beast 32GB DDR5',      preco: 699.90,  estoque: 25, idCategoria: ramCat.id,  descricao: '2x 16GB DDR5-5600'                         },
    { nome: 'Samsung 990 Pro 2TB NVMe',           preco: 849.00,  estoque: 20, idCategoria: ssdCat.id,  descricao: 'PCIe 4.0, leitura 7.450 MB/s'             },
    { nome: 'Teclado HyperX Alloy Origins TKL',  preco: 499.00,  estoque: 30, idCategoria: periCat.id, descricao: 'Switch Red, RGB, TKL'                      },
    { nome: 'Mouse Logitech G502 X Plus',         preco: 699.00,  estoque: 18, idCategoria: periCat.id, descricao: 'Sem fio, 25.600 DPI, sensor Hero 2'        },
  ];

  const produtos = [];
  for (const p of produtosData) {
    const created = await prisma.produto.create({ data: p });
    produtos.push(created);
  }
  console.log(`✅ ${produtos.length} produtos criados.`);

  // ── 3. Usuários (5 registros) ───────────────────────────────────────────
  const adminHash = await bcrypt.hash('Admin@123', 10);
  const userHash  = await bcrypt.hash('Cliente@123', 10);

  const usuariosData = [
    { nome: 'Administrador SwiftCart', email: 'admin@swiftcart.dev', senha: adminHash, tipoAcesso: 'ADMIN', cep: '01310100', logradouro: 'Avenida Paulista', bairro: 'Bela Vista', cidade: 'São Paulo', uf: 'SP', numero: '1000' },
    { nome: 'João da Silva',           email: 'cliente@swiftcart.dev', senha: userHash, tipoAcesso: 'CLIENTE', cep: '30112010', logradouro: 'Rua da Bahia', bairro: 'Centro', cidade: 'Belo Horizonte', uf: 'MG', numero: '123' },
    { nome: 'Maria Souza',             email: 'cliente2@swiftcart.dev', senha: userHash, tipoAcesso: 'CLIENTE', cep: '22021001', logradouro: 'Avenida Atlântica', bairro: 'Copacabana', cidade: 'Rio de Janeiro', uf: 'RJ', numero: '456' },
    { nome: 'Pedro Santos',            email: 'cliente3@swiftcart.dev', senha: userHash, tipoAcesso: 'CLIENTE', cep: '90010001', logradouro: 'Rua dos Andradas', bairro: 'Centro Histórico', cidade: 'Porto Alegre', uf: 'RS', numero: '789' },
    { nome: 'Ana Oliveira',            email: 'cliente4@swiftcart.dev', senha: userHash, tipoAcesso: 'CLIENTE', cep: '70040010', logradouro: 'Eixo Monumental', bairro: 'Asa Sul', cidade: 'Brasília', uf: 'DF', numero: '10' },
  ];

  const usuarios = [];
  for (const u of usuariosData) {
    const created = await prisma.usuario.create({ data: u });
    usuarios.push(created);
  }
  console.log(`✅ ${usuarios.length} usuários criados.`);

  // ── 4. CarrinhoItem (5 registros) ───────────────────────────────────────
  const carrinhoItensData = [
    { idUsuario: usuarios[1].id, idProduto: produtos[0].id, quantidade: 1 }, // João: RTX 4070
    { idUsuario: usuarios[1].id, idProduto: produtos[4].id, quantidade: 2 }, // João: RAM Kingston
    { idUsuario: usuarios[2].id, idProduto: produtos[2].id, quantidade: 1 }, // Maria: Ryzen 7
    { idUsuario: usuarios[2].id, idProduto: produtos[5].id, quantidade: 1 }, // Maria: SSD Samsung
    { idUsuario: usuarios[3].id, idProduto: produtos[6].id, quantidade: 1 }, // Pedro: Teclado HyperX
  ];

  for (const item of carrinhoItensData) {
    await prisma.carrinhoItem.create({ data: item });
  }
  console.log(`✅ ${carrinhoItensData.length} itens de carrinho criados.`);

  // ── 5. Wishlist (5 registros) ───────────────────────────────────────────
  const wishlistData = [
    { idUsuario: usuarios[1].id, idProduto: produtos[1].id }, // João quer RX 7800 XT
    { idUsuario: usuarios[1].id, idProduto: produtos[7].id }, // João quer Mouse Logitech
    { idUsuario: usuarios[2].id, idProduto: produtos[0].id }, // Maria quer RTX 4070
    { idUsuario: usuarios[3].id, idProduto: produtos[3].id }, // Pedro quer Core i9
    { idUsuario: usuarios[4].id, idProduto: produtos[2].id }, // Ana quer Ryzen 7
  ];

  for (const wish of wishlistData) {
    await prisma.wishlist.create({ data: wish });
  }
  console.log(`✅ ${wishlistData.length} registros de wishlist criados.`);

  // ── 6. Pedidos (5 registros) ───────────────────────────────────────────
  const pedidosData = [
    { idUsuario: usuarios[1].id, total: 4799.99, status: 'ENTREGUE' },
    { idUsuario: usuarios[1].id, total: 699.90,  status: 'PENDENTE' },
    { idUsuario: usuarios[2].id, total: 3048.90, status: 'PAGO' },
    { idUsuario: usuarios[3].id, total: 499.00,  status: 'ENTREGUE' },
    { idUsuario: usuarios[4].id, total: 2199.90, status: 'CANCELADO' },
  ];

  for (const ped of pedidosData) {
    await prisma.pedido.create({ data: ped });
  }
  console.log(`✅ ${pedidosData.length} pedidos criados.`);

  // ── 7. Avaliações (5 registros) ─────────────────────────────────────────
  const avaliacoesData = [
    { idUsuario: usuarios[1].id, idProduto: produtos[0].id, nota: 5, comentario: 'Performance absurda em 1440p. Recomendo!' },
    { idUsuario: usuarios[2].id, idProduto: produtos[0].id, nota: 4, comentario: 'Excelente, mas esquenta um pouco sob carga.' },
    { idUsuario: usuarios[3].id, idProduto: produtos[2].id, nota: 5, comentario: 'Melhor CPU custo-benefício para games.' },
    { idUsuario: usuarios[2].id, idProduto: produtos[5].id, nota: 4, comentario: 'Leitura rapidíssima, instalação simples.' },
    { idUsuario: usuarios[4].id, idProduto: produtos[6].id, nota: 3, comentario: 'Bom teclado, mas o cabo é curto.' },
  ];

  for (const av of avaliacoesData) {
    await prisma.avaliacao.create({ data: av });
  }
  console.log(`✅ ${avaliacoesData.length} avaliações criadas.`);

  console.log('\n🎉 Seed concluído com sucesso!');
  console.log('   Admin:      admin@swiftcart.dev   / Admin@123');
  console.log('   Cliente 1:  cliente@swiftcart.dev / Cliente@123');
  console.log('   Cliente 2:  cliente2@swiftcart.dev / Cliente@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
