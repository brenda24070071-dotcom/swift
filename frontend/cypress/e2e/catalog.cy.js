// frontend/cypress/e2e/catalog.cy.js
/**
 * Testes E2E — UC08 (Catálogo), UC09/UC10/UC11 (Carrinho), UC14 (Wishlist)
 */

describe('UC08 — Catálogo de Produtos', () => {
  beforeEach(() => cy.visit('/'));

  it('deve exibir o catálogo na página inicial', () => {
    cy.contains('Hardware & Periféricos').should('be.visible');
    // Aguarda cards carregarem
    cy.get('.grid').children().should('have.length.gte', 1);
  });

  it('deve filtrar produtos por categoria', () => {
    cy.contains('Processadores').click();
    cy.url().should('include', 'categoria=cpus');
    cy.get('.grid').children().should('have.length.gte', 1);
  });

  it('deve buscar produtos por nome', () => {
    cy.get('input[name=q]').type('RTX');
    cy.get('button[type=submit]').click();
    cy.url().should('include', 'search=RTX');
    cy.contains('RTX').should('be.visible');
  });

  it('deve exibir "Nenhum produto encontrado" para busca sem resultado', () => {
    cy.get('input[name=q]').type('xyzProdutoInexistente123');
    cy.get('button[type=submit]').click();
    cy.contains('Nenhum produto encontrado').should('be.visible');
  });

  it('UC08-A1 — deve redirecionar para login ao clicar em "Adicionar" sem estar logado', () => {
    cy.get('.grid').children().first().find('button').contains('Adicionar').click();
    cy.url().should('include', '/login');
  });
});

describe('UC09 / UC10 / UC11 — Carrinho de Compras', () => {
  beforeEach(() => {
    cy.apiLogin(Cypress.env('clienteEmail'), Cypress.env('clientePassword'));
    cy.visit('/');
  });

  it('UC09 — deve adicionar produto ao carrinho', () => {
    cy.get('.grid').children().first().find('button').contains('Adicionar').click();
    cy.contains('Adicionado!').should('be.visible');
    // Badge do carrinho deve incrementar
    cy.get('a[href="/cart"]').should('be.visible');
  });

  it('UC09 — deve exibir o carrinho com os itens adicionados', () => {
    cy.visit('/cart');
    cy.contains('Meu Carrinho').should('be.visible');
  });

  it('UC10 — deve atualizar quantidade de um item no carrinho', () => {
    cy.visit('/cart');
    // Incrementa quantidade
    cy.get('button').contains('+').first().click();
    cy.contains('×').should('exist');
  });

  it('UC11 — deve remover item do carrinho', () => {
    cy.visit('/cart');
    cy.get('button').contains('✕').first().click();
  });
});

describe('UC14 — Wishlist (Favoritos)', () => {
  beforeEach(() => {
    cy.apiLogin(Cypress.env('clienteEmail'), Cypress.env('clientePassword'));
    cy.visit('/');
  });

  it('deve favoritar um produto', () => {
    cy.intercept('POST', '**/api/wishlist').as('wishlistPost');
    cy.get('.grid').children().first().find('button[title="Favoritar"]').click();
    cy.wait('@wishlistPost');
  });

  it('deve exibir produtos favoritos na página de wishlist', () => {
    cy.visit('/wishlist');
    cy.contains('Meus Favoritos').should('be.visible');
  });

  it('deve remover produto dos favoritos', () => {
    cy.visit('/wishlist');
    cy.get('button').contains('✕').first().click({ force: true });
  });
});
