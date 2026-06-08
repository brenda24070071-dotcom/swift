// frontend/cypress/support/e2e.js

// ── Comandos customizados ─────────────────────────────────────────────────

/**
 * cy.login(email, senha) — Faz login via UI
 */
Cypress.Commands.add('login', (email, senha) => {
  cy.visit('/login');
  cy.get('[data-cy=email]').clear().type(email);
  cy.get('[data-cy=senha]').clear().type(senha);
  cy.get('[data-cy=btn-login]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
});

/**
 * cy.loginAdmin() — Login rápido como administrador
 */
Cypress.Commands.add('loginAdmin', () => {
  cy.login(Cypress.env('adminEmail'), Cypress.env('adminPassword'));
});

/**
 * cy.loginCliente() — Login rápido como cliente
 */
Cypress.Commands.add('loginCliente', () => {
  cy.login(Cypress.env('clienteEmail'), Cypress.env('clientePassword'));
});

/**
 * cy.apiLogin(email, senha) — Login via API (mais rápido para testes que não testam o login em si)
 */
Cypress.Commands.add('apiLogin', (email, senha) => {
  cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, senha })
    .then((res) => {
      localStorage.setItem('swiftcart_token', res.body.token);
      localStorage.setItem('swiftcart_user', JSON.stringify(res.body.usuario));
    });
});

// Ignora erros de rede não críticos em testes
Cypress.on('uncaught:exception', () => false);
