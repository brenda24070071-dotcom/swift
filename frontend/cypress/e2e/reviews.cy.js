// frontend/cypress/e2e/reviews.cy.js
/**
 * Testes E2E — CRUD de Avaliações (rating 1–5 estrelas).
 * Cada execução cria um usuário novo (sem avaliação prévia) via API,
 * garantindo que o formulário de envio esteja disponível.
 */

const api = Cypress.env('apiUrl');

/** Registra e autentica um usuário único; retorna o e-mail. */
function novoUsuarioLogado() {
  const email = `review_${Date.now()}_${Math.floor(Math.random() * 1e4)}@swiftcart.com`;
  const senha = 'Teste@123';
  cy.request('POST', `${api}/auth/register`, { nome: 'Avaliador E2E', email, senha });
  cy.request('POST', `${api}/auth/login`, { email, senha }).then((res) => {
    window.localStorage.setItem('swiftcart_token', res.body.token);
    window.localStorage.setItem('swiftcart_user', JSON.stringify(res.body.usuario));
  });
  return email;
}

describe('Avaliações de Produto', () => {
  it('navega do catálogo para a página de detalhe do produto', () => {
    cy.visit('/');
    cy.get('.grid').children().first().find('a[href^="/products/"]').first().click();
    cy.url().should('include', '/products/');
    cy.contains('Avaliações de clientes').should('be.visible');
  });

  it('exibe convite para login quando deslogado', () => {
    cy.visit('/products/1');
    cy.contains('para avaliar este produto').should('be.visible');
    cy.get('[data-cy=review-form]').should('not.exist');
  });

  it('exige selecionar a nota antes de enviar (validação)', () => {
    novoUsuarioLogado();
    cy.visit('/products/1');
    cy.get('[data-cy=review-form]').should('be.visible');
    // Envia sem escolher estrela
    cy.get('[data-cy=review-submit]').click();
    cy.get('[data-cy=review-error]').should('contain.text', '1 a 5 estrelas');
  });

  it('envia uma avaliação de 5 estrelas e a exibe na listagem', () => {
    novoUsuarioLogado();
    cy.visit('/products/1');

    cy.get('[data-cy=review-form] [data-cy=star-5]').click();
    cy.get('[data-cy=review-comment]').type('Produto excelente, entrega rápida!');
    cy.intercept('POST', '**/api/products/*/reviews').as('postReview');
    cy.get('[data-cy=review-submit]').click();

    cy.wait('@postReview').then((interception) => {
      expect(interception.response.statusCode).to.eq(201);
    });

    cy.get('[data-cy=review-success]').should('be.visible');
    cy.get('[data-cy=review-list]')
      .should('contain.text', 'Produto excelente, entrega rápida!')
      .and('contain.text', 'Avaliador E2E');
  });

  it('permite o autor excluir a própria avaliação', () => {
    novoUsuarioLogado();
    cy.visit('/products/1');

    cy.get('[data-cy=review-form] [data-cy=star-3]').click();
    cy.get('[data-cy=review-comment]').type('Avaliação temporária para exclusão.');
    cy.get('[data-cy=review-submit]').click();
    cy.get('[data-cy=review-success]').should('be.visible');

    // Exclui a própria avaliação (botão visível só para dono/admin)
    cy.contains('[data-cy=review-item]', 'Avaliação temporária para exclusão.')
      .find('[data-cy=review-delete]')
      .click();

    cy.get('[data-cy=review-list]').should('not.contain.text', 'Avaliação temporária para exclusão.');
  });
});
