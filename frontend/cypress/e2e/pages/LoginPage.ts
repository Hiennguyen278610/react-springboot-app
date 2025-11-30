class LoginPage {
    private selectors = {
        usernameInput: 'input[name="username"]',
        passwordInput: 'input[name="password"]',
        submitButton: 'button[type="submit"]',
        usernameError: '.text-red-500',
        passwordError: '.text-red-500',
        generalError: '.text-red-500.text-center',
        loadingSpinner: '.animate-spin',
        cardTitle: '.text-2xl.text-primary',
    }

    visit() {
        cy.visit('/login')
        return this
    }

    getUsernameInput() {
        return cy.get(this.selectors.usernameInput)
    }

    getPasswordInput() {
        return cy.get(this.selectors.passwordInput)
    }

    getSubmitButton() {
        return cy.get(this.selectors.submitButton)
    }

    typeUsername(username: string) {
        this.getUsernameInput().clear().type(username)
        return this
    }

    typePassword(password: string) {
        this.getPasswordInput().clear().type(password)
        return this
    }

    clickSubmit() {
        this.getSubmitButton().click()
        return this
    }

    login(username: string, password: string) {
        this.typeUsername(username)
        this.typePassword(password)
        this.clickSubmit()
        return this
    }

    getErrorMessages() {
        return cy.get(this.selectors.usernameError)
    }

    getGeneralError() {
        return cy.get(this.selectors.generalError)
    }

    isLoading() {
        return cy.get(this.selectors.loadingSpinner).should('be.visible')
    }
    waitForLoadingComplete() {
        cy.get(this.selectors.loadingSpinner).should('not.exist')
        return this
    }

    verifyPageTitle() {
        cy.get(this.selectors.cardTitle).should('contain', 'Chào mừng đến với Flogin')
        return this
    }

    verifyFormElements() {
        this.getUsernameInput().should('be.visible')
        this.getPasswordInput().should('be.visible')
        this.getSubmitButton().should('be.visible')
        return this
    }
}

export default new LoginPage()
