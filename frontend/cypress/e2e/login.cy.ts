describe('Login E2E Tests', () => {
  const component = {
    usernameInput: '[data-testid="username-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    usernameError: '[data-testid="username-error"]',
    passwordError: '[data-testid="password-error"]',
  }

  const userResponse = {
    id: 1,
    username: 'Hyan2005',
    mail: 'hyan@example.com'
  }

  const loginResponse = {
    success: true,
    message: 'Đăng nhập thành công',
    token: 'fake-jwt-token',
    userResponse: userResponse
  }

  const loginRequest: string = "loginRequest";
  const meRequest: string = "meRequest";

  const arrangeLoginRequest = (statusCode = 200, body = loginResponse) => {
    cy.intercept('POST', '**/auth/login', { statusCode, body }).as(loginRequest)
  }

  const arrangeMeRequest = (statusCode = 200, body = userResponse) => {
    cy.intercept('GET', '**/auth/me', { statusCode, body }).as(meRequest)
  }

  const fillLoginForm = (username: string, password: string) => {
    cy.get(component.usernameInput).type(username)
    cy.get(component.passwordInput).type(password)
  }

  const submitLogin = () => {
    cy.get(component.loginButton).click()
  }

  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
  })

  // ========== TEST CASES ==========
  it('TC_E2E_LOGIN_001: Nên hiển thị form login', () => {
    cy.get(component.usernameInput).should('be.visible')
    cy.get(component.passwordInput).should('be.visible')
    cy.get(component.loginButton).should('be.visible')
  })

  it('TC_E2E_LOGIN_002: Nên login thành công với credentials hợp lệ', () => {
    // Arrange
    arrangeLoginRequest()
    arrangeMeRequest()

    // Action
    fillLoginForm('Hyan2005', 'sugoi123')
    submitLogin()

    // Assert
    cy.wait('@' + loginRequest)
    cy.wait('@' + meRequest)
    cy.url().should('include', '/home')
  })

  it('TC_E2E_LOGIN_003: Nên hiển thị lỗi với credentials không hợp lệ', () => {
    // Action
    fillLoginForm('ab', 'Test123')
    submitLogin()

    // Assert
    cy.get(component.usernameError).should('be.visible')
  })
})
