/// <reference types="cypress" />

// Import commands.js using ES2015 syntax:
import './commands'

// Import Testing Library commands
import '@testing-library/cypress/add-commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top
if (app && !app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style')
  style.setAttribute('data-hide-command-log-request', '')
  style.innerHTML = '.command-name-request, .command-name-xhr { display: none }'
  app.document.head.appendChild(style)
}

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  console.log('Uncaught exception:', err.message)
  return false
})
