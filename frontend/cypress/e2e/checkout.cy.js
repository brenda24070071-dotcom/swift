// frontend/cypress/e2e/checkout.cy.js
/**
 * Testes E2E — UC15 (Checkout), UC05/UC06/UC07 (Admin CRUD Produtos)
 */

describe('UC15 — Finalizar Pedido (Checkout)', () => {
  beforeEach(() => {
    cy.apiLogin(Cypress.env('clienteEmail'), Cypress.env('clientePassword'));
  });

  it('deve exibir o resumo do pedido na página de checkout', () => {
    // Adiciona item via API antes do teste
    cy.then(() => {
      const token = localStorage.getItem('swiftcart_token');
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/cart`,
        body: { idProduto: 1, quantidade: 1 },
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });

    cy.visit('/checkout');
    cy.contains('Finalizar Pedido').should('be.visible');
  });

  it('deve exibir aviso de carrinho vazio se não houver itens', () => {
    // Limpa o carrinho via API
    cy.then(() => {
      const token = localStorage.getItem('swiftcart_token');
      cy.request({
        method: 'GET',
        url: `${Cypress.env('apiUrl')}/cart`,
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      }).then((res) => {
        (res.body?.itens || []).forEach((item) => {
          cy.request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/cart/${item.id}`,
            headers: { Authorization: `Bearer ${token}` },
            failOnStatusCode: false,
          });
        });
      });
    });

    cy.visit('/checkout');
    cy.contains('carrinho está vazio').should('be.visible');
  });

  it('deve completar o checkout e exibir confirmação', () => {
    // Adiciona item
    cy.then(() => {
      const token = localStorage.getItem('swiftcart_token');
      cy.request({
        method: 'POST',
        url: `${Cypress.env('apiUrl')}/cart`,
        body: { idProduto: 1, quantidade: 1 },
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });

    cy.visit('/checkout');
    cy.get('[data-cy=btn-checkout]').click();
    cy.contains('Pedido Realizado!').should('be.visible');
    cy.contains('Continuar Comprando').should('be.visible');
  });
});

describe('UC05 / UC06 / UC07 — Admin: CRUD de Produtos', () => {
  beforeEach(() => {
    cy.apiLogin(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
  });

  it('UC05 — deve criar um novo produto', () => {
    cy.visit('/admin/products');
    cy.contains('Novo Produto').should('be.visible');

    cy.get('input[name=nome]').type('Produto Cypress Test');
    cy.get('input[name=preco]').clear().type('999.99');
    cy.get('input[name=estoque]').clear().type('10');
    cy.get('button[type=submit]').contains('Criar Produto').click();

    cy.url().should('include', '/admin/products');
  });

  it('deve redirecionar não-admin para home', () => {
    cy.apiLogin(Cypress.env('clienteEmail'), Cypress.env('clientePassword'));
    cy.visit('/admin/products');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});

describe('UC12 / UC13 — Admin: CRUD de Categorias', () => {
  beforeEach(() => {
    cy.apiLogin(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
  });

  it('UC12 — deve criar nova categoria', () => {
    cy.visit('/admin/categories');
    cy.get('input[name=nome]').type(`zzz Categoria E2E ${Date.now()}`);
    cy.get('button[type=submit]').contains('Criar Categoria').click();
    cy.contains('Categoria criada').should('be.visible');
  });

  it('deve listar categorias existentes em tabela', () => {
    cy.visit('/admin/categories');
    cy.get('table').should('be.visible');
    cy.get('tbody tr').should('have.length.gte', 1);
  });

  it('UC13 — não deve excluir categoria com produtos vinculados', () => {
    cy.visit('/admin/categories');
    // Tenta excluir a primeira categoria da lista (com produtos do seed)
    cy.get('tbody tr').first().find('button').contains('Excluir').click();
    // O backend retornará 409 — a mensagem de erro deve aparecer
    cy.contains('produtos vinculado').should('be.visible');
  });
});
