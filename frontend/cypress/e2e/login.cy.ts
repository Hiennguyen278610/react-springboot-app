describe('Login E2E Tests', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
  })

  it('TC_E2E_LOGIN_001: Nên hiển thị form login', () => {
    cy.get('[data-testid="username-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="login-button"]').should('be.visible')
  })

  it('TC_E2E_LOGIN_002: Nên login thành công với credentials hợp lệ', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        success: true,
        message: 'Đăng nhập thành công',
        token: 'fake-jwt-token',
        userResponse: { id: 1, username: 'Hyan2005', mail: 'hyan@example.com' }
      }
    }).as('loginRequest')

    cy.intercept('GET', '**/auth/me', {
      statusCode: 200,
      body: { id: 1, username: 'Hyan2005', mail: 'hyan@example.com' }
    }).as('meRequest')

    cy.get('[data-testid="username-input"]').type('Hyan2005')
    cy.get('[data-testid="password-input"]').type('sugoi123')
    cy.get('[data-testid="login-button"]').click()

    cy.wait('@loginRequest')
    cy.wait('@meRequest')

    cy.url().should('include', '/home')
  })

  it('TC_E2E_LOGIN_003: Nên hiển thị lỗi với credentials không hợp lệ', () => {
    cy.get('[data-testid="username-input"]').type('ab')
    cy.get('[data-testid="password-input"]').type('Test123')
    cy.get('[data-testid="login-button"]').click()

    cy.get('[data-testid="username-error"]').should('be.visible')
  })
})
