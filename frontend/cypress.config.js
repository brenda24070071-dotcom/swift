// frontend/cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth:  1280,
    viewportHeight: 800,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 8000,
    env: {
      apiUrl:         'http://localhost:3000/api',
      adminEmail:     'admin@swiftcart.dev',
      adminPassword:  'Admin@123',
      clienteEmail:   'cliente@swiftcart.dev',
      clientePassword:'Cliente@123',
    },
  },
});
