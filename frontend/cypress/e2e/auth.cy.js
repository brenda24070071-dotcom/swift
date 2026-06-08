// frontend/cypress/e2e/auth.cy.js
/**
 * Testes E2E — UC01 (Cadastro) e UC02 (Login)
 */

const timestamp  = Date.now();
const testEmail  = `teste_${timestamp}@swiftcart.e2e`;
const testSenha  = 'Teste@123';
const testNome   = 'Usuário E2E';

describe('UC01 — Cadastro de Usuário', () => {
  beforeEach(() => cy.visit('/register'));

  it('deve exibir o formulário de cadastro', () => {
    cy.contains('Criar Conta').should('be.visible');
    cy.get('[data-cy=nome]').should('exist');
    cy.get('[data-cy=email]').should('exist');
    cy.get('[data-cy=senha]').should('exist');
  });

  it('deve cadastrar um novo usuário com dados válidos', () => {
    cy.get('[data-cy=nome]').type(testNome);
    cy.get('[data-cy=email]').type(testEmail);
    cy.get('[data-cy=senha]').type(testSenha);
    cy.get('[data-cy=btn-register]').click();

    cy.contains('Conta criada com sucesso').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('UC01-A1 — deve preencher endereço automaticamente ao digitar CEP válido', () => {
    cy.intercept('GET', '**/viacep.com.br/ws/01001000/json/**', {
      logradouro: 'Praça da Sé',
      bairro: 'Sé',
      localidade: 'São Paulo',
      uf: 'SP',
    }).as('viacep');

    cy.get('[data-cy=cep]').type('01001000').trigger('blur');

    // Aguarda retorno da API ViaCEP (ou mock)
    cy.get('input[name=cidade]').should('not.have.value', '');
    cy.get('input[name=uf]').should('not.have.value', '');
  });

  it('deve mostrar erro para e-mail já cadastrado', () => {
    // Usa o e-mail do seed (cliente demo)
    cy.get('[data-cy=nome]').type('Outro Nome');
    cy.get('[data-cy=email]').type(Cypress.env('clienteEmail'));
    cy.get('[data-cy=senha]').type(testSenha);
    cy.get('[data-cy=btn-register]').click();

    cy.contains('E-mail já cadastrado').should('be.visible');
  });

  it('deve mostrar erro para senha inválida (sem maiúscula)', () => {
    cy.get('[data-cy=nome]').type('Teste');
    cy.get('[data-cy=email]').type(`fraca_${timestamp}@test.com`);
    cy.get('[data-cy=senha]').type('senhafraca1@');
    cy.get('[data-cy=btn-register]').click();

    // Validação Joi do backend retorna 400
    cy.get('body').should('contain.text', 'Senha');
  });
});

describe('UC02 — Login', () => {
  beforeEach(() => cy.visit('/login'));

  it('deve exibir o formulário de login', () => {
    cy.contains('Entrar').should('be.visible');
    cy.get('[data-cy=email]').should('exist');
    cy.get('[data-cy=senha]').should('exist');
  });

  it('deve autenticar e redirecionar para Home com credenciais válidas', () => {
    cy.get('[data-cy=email]').type(Cypress.env('clienteEmail'));
    cy.get('[data-cy=senha]').type(Cypress.env('clientePassword'));
    cy.get('[data-cy=btn-login]').click();

    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('SwiftCart').should('be.visible');
  });

  it('deve exibir mensagem de erro para senha incorreta', () => {
    cy.get('[data-cy=email]').type(Cypress.env('clienteEmail'));
    cy.get('[data-cy=senha]').type('SenhaErrada@99');
    cy.get('[data-cy=btn-login]').click();

    cy.contains('Credenciais inválidas').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('deve exibir erro para e-mail não cadastrado', () => {
    cy.get('[data-cy=email]').type('inexistente@notexist.com');
    cy.get('[data-cy=senha]').type('Qualquer@1');
    cy.get('[data-cy=btn-login]').click();

    cy.contains('Credenciais inválidas').should('be.visible');
  });

  it('deve fazer logout corretamente', () => {
    cy.loginCliente();
    // Abre o dropdown do usuário e clica em Sair
    cy.contains('João').click();
    cy.contains('Sair').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    cy.contains('Entrar').should('be.visible');
  });
});
