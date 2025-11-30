class ProductPage {
  private selectors = {
    pageTitle: 'h1, [data-testid="page-title"]',
    addProductButton: 'button:contains("Thêm"), [data-testid="add-product-btn"]',
    productTable: 'table, [data-testid="product-table"]',
    productRow: 'tbody tr, [data-testid="product-row"]',
    productNameInput: 'input[name="name"], [data-testid="product-name"]',
    productPriceInput: 'input[name="price"], [data-testid="product-price"]',
    productQuantityInput: 'input[name="quantity"], [data-testid="product-quantity"]',
    productDescriptionInput: 'textarea[name="description"], [data-testid="product-description"]',
    productCategorySelect: 'select[name="category"], [data-testid="product-category"]',
    submitButton: 'button[type="submit"], [data-testid="submit-btn"]',
    cancelButton: 'button:contains("Hủy"), [data-testid="cancel-btn"]',
    editButton: '[data-testid="edit-btn"], button:contains("Sửa")',
    deleteButton: '[data-testid="delete-btn"], button:contains("Xóa")',
    confirmDeleteButton: '[data-testid="confirm-delete"], button:contains("Xác nhận")',
    successMessage: '[data-testid="success-message"], .toast-success',
    errorMessage: '[data-testid="error-message"], .toast-error',
    dialog: '[role="dialog"], .dialog',
    searchInput: 'input[type="search"], [data-testid="search-input"]',
  }

  visit() {
    cy.visit('/home/products')
    return this
  }

  clickAddNew() {
    cy.contains('button', /thêm|add/i).click()
    return this
  }

  fillProductForm(product: {
    name?: string
    price?: string | number
    quantity?: string | number
    description?: string
    category?: string
  }) {
    if (product.name) {
      cy.get(this.selectors.productNameInput).first().clear().type(product.name)
    }
    if (product.price) {
      cy.get(this.selectors.productPriceInput).first().clear().type(String(product.price))
    }
    if (product.quantity) {
      cy.get(this.selectors.productQuantityInput).first().clear().type(String(product.quantity))
    }
    if (product.description) {
      cy.get(this.selectors.productDescriptionInput).first().clear().type(product.description)
    }
    if (product.category) {
      cy.get(this.selectors.productCategorySelect).first().select(product.category)
    }
    return this
  }

  submitForm() {
    cy.get(this.selectors.submitButton).first().click()
    return this
  }

  getProductTable() {
    return cy.get(this.selectors.productTable)
  }
 
  getProductRows() {
    return cy.get(this.selectors.productRow)
  }

  findProductByName(name: string) {
    return cy.contains(this.selectors.productRow, name)
  }

  clickEditOnProduct(productName: string) {
    this.findProductByName(productName).within(() => {
      cy.get(this.selectors.editButton).click()
    })
    return this
  }

  clickDeleteOnProduct(productName: string) {
    this.findProductByName(productName).within(() => {
      cy.get(this.selectors.deleteButton).click()
    })
    return this
  }

  confirmDelete() {
    cy.get(this.selectors.confirmDeleteButton).click()
    return this
  }

  cancelDelete() {
    cy.get(this.selectors.cancelButton).click()
    return this
  }

  verifySuccessMessage(message?: string) {
    if (message) {
      cy.contains(message).should('be.visible')
    } else {
      cy.get(this.selectors.successMessage).should('be.visible')
    }
    return this
  }

  verifyErrorMessage(message?: string) {
    if (message) {
      cy.contains(message).should('be.visible')
    } else {
      cy.get(this.selectors.errorMessage).should('be.visible')
    }
    return this
  }

  verifyProductExists(productName: string) {
    this.findProductByName(productName).should('exist')
    return this
  }

  verifyProductNotExists(productName: string) {
    cy.contains(this.selectors.productRow, productName).should('not.exist')
    return this
  }

  searchProduct(searchTerm: string) {
    cy.get(this.selectors.searchInput).clear().type(searchTerm)
    return this
  }

  clearSearch() {
    cy.get(this.selectors.searchInput).clear()
    return this
  }
}

export default new ProductPage()
