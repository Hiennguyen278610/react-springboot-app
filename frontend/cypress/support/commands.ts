/// <reference types="cypress" />

// Custom commands for testing
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login via API
       * @example cy.login('username', 'password')
       */
      login(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to login via UI
       * @example cy.loginViaUI('username', 'password')
       */
      loginViaUI(username: string, password: string): Chainable<void>
      
      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>
      
      /**
       * Custom command to get element by data-testid
       * @example cy.getByTestId('login-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>
    }
  }
}

// -- Login command via API --
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: { username, password },
  }).then((response) => {
    expect(response.status).to.eq(200)
    window.localStorage.setItem('token', response.body.token)
  })
})

// -- Login command via UI --
Cypress.Commands.add('loginViaUI', (username: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="username"]').type(username)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

// -- Logout command --
Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token')
  cy.visit('/login')
})

// -- Get by data-testid --
Cypress.Commands.add('getByTestId', (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`)
})

export {}
