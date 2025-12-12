describe('Product E2E Tests', () => {
  const component = {
    usernameInput: '[data-testid="username-input"]',
    passwordInput: '[data-testid="password-input"]',
    loginButton: '[data-testid="login-button"]',
    tableBody: 'table tbody',
    tableRow: 'table tbody tr',
    nameInput: '#name',
    priceInput: '#price',
    quantityInput: '#quantity',
    descriptionInput: '#description',
    categorySelect: '#category',
    searchInput: 'input[placeholder="Tìm kiếm..."]',
    searchSelect: 'select',
  }

  // ========== MOCK DATA ==========
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

  const productList = [
    {
      id: 1,
      name: 'Laptop Dell XPS',
      price: 15000000,
      quantity: 10,
      description: 'Laptop cao cấp',
      category: 'DIEN_TU'
    },
    {
      id: 2,
      name: 'iPhone 15',
      price: 25000000,
      quantity: 5,
      description: 'Điện thoại Apple',
      category: 'DIEN_TU'
    }
  ]

  const newProduct = {
    id: 3,
    name: 'MacBook Pro',
    price: 35000000,
    quantity: 5,
    description: 'Laptop Apple cao cấp',
    category: 'DIEN_TU'
  }

  const updatedProduct = {
    id: 1,
    name: 'Laptop Dell XPS 15',
    price: 18000000,
    quantity: 8,
    description: 'Laptop cao cấp - updated',
    category: 'DIEN_TU'
  }

  const loginRequest: string = 'loginRequest'
  const meRequest: string = 'meRequest'
  const getProductsRequest: string = 'getProducts'
  const createProductRequest: string = 'createProduct'
  const updateProductRequest: string = 'updateProduct'
  const deleteProductRequest: string = 'deleteProduct'

  const arrangeLoginRequest = (statusCode = 200, body = loginResponse) => {
    cy.intercept('POST', '**/auth/login', { statusCode, body }).as(loginRequest)
  }

  const arrangeMeRequest = (statusCode = 200, body = userResponse) => {
    cy.intercept('GET', '**/auth/me', { statusCode, body }).as(meRequest)
  }

  const arrangeGetProductsRequest = (statusCode = 200, body = productList) => {
    cy.intercept('GET', '**/api/products*', { statusCode, body }).as(getProductsRequest)
  }

  const arrangeCreateProductRequest = (statusCode = 201, body = newProduct) => {
    cy.intercept('POST', '**/api/products', { statusCode, body }).as(createProductRequest)
  }

  const arrangeUpdateProductRequest = (productId: number, statusCode = 200, body = updatedProduct) => {
    cy.intercept('PUT', `**/api/products/${productId}`, { statusCode, body }).as(updateProductRequest)
  }

  const arrangeDeleteProductRequest = (productId: number, statusCode = 200) => {
    cy.intercept('DELETE', `**/api/products/${productId}`, { statusCode, body: { success: true } }).as(deleteProductRequest)
  }

  const performLogin = (username = 'Hyan2005', password = 'sugoi123') => {
    cy.get(component.usernameInput).type(username)
    cy.get(component.passwordInput).type(password)
    cy.get(component.loginButton).click()
  }

  const fillProductForm = (product: { name: string; price: number; quantity: number; description: string; category: string }) => {
    cy.get(component.nameInput).clear().type(product.name)
    cy.get(component.priceInput).clear().type(product.price.toString())
    cy.get(component.quantityInput).clear().type(product.quantity.toString())
    cy.get(component.descriptionInput).clear().type(product.description)
    cy.get(component.categorySelect).select(product.category)
  }

  const clickAddProductButton = () => {
    cy.contains('button', /Thêm sản phẩm|thêm|add/i).click()
  }

  const clickCreateProductButton = () => {
    cy.contains('button', /Tạo sản phẩm|tạo/i).click()
  }

  const clickUpdateProductButton = () => {
    cy.contains('button', /Cập nhật|cập nhật/i).click()
  }

  const clickDeleteProductButton = () => {
    cy.contains('button', /Xóa sản phẩm|xóa/i).click()
  }

  const clickEditButtonOnRow = (rowIndex = 0) => {
    cy.get(component.tableRow).eq(rowIndex).within(() => {
      cy.get('button svg').first().parent().click()
    })
  }

  const clickDeleteButtonOnRow = (rowIndex = 0) => {
    cy.get(component.tableRow).eq(rowIndex).within(() => {
      cy.get('button').last().click()
    })
  }

  const searchProduct = (searchField: string, searchValue: string) => {
    cy.get(component.searchSelect).first().select(searchField)
    cy.get(component.searchInput).type(searchValue)
  }

  const clearSearch = () => {
    cy.get(component.searchInput).clear()
  }

  beforeEach(() => {
    arrangeLoginRequest()
    arrangeMeRequest()

    cy.visit('http://localhost:3000/login')
    performLogin()

    cy.wait('@' + loginRequest)
    cy.wait('@' + meRequest)

    arrangeGetProductsRequest()
    cy.visit('http://localhost:3000/home/products')
    cy.wait('@' + getProductsRequest)
  })

  it('TC_E2E_PRODUCT_001: Nên tạo sản phẩm mới thành công', () => {
    // Arrange
    arrangeCreateProductRequest()

    // Action
    clickAddProductButton()
    cy.contains('Thêm sản phẩm mới').should('be.visible')
    fillProductForm(newProduct)
    clickCreateProductButton()

    // Assert
    cy.wait('@' + createProductRequest)
    cy.contains('Thêm sản phẩm mới').should('not.exist')
  })

  it('TC_E2E_PRODUCT_002: Nên hiển thị danh sách sản phẩm', () => {
    // Assert
    cy.get(component.tableRow).should('have.length', 2)

    cy.get(component.tableRow).first().within(() => {
      cy.contains('td', 'Laptop Dell XPS').should('be.visible')
      cy.contains('td', '10').should('be.visible')
    })

    cy.get(component.tableRow).last().within(() => {
      cy.contains('td', 'iPhone 15').should('be.visible')
      cy.contains('td', '5').should('be.visible')
    })
  })

  it('TC_E2E_PRODUCT_003: Nên cập nhật sản phẩm thành công', () => {
    // Arrange
    arrangeUpdateProductRequest(1)

    // Action
    clickEditButtonOnRow(0)
    cy.contains('Chỉnh sửa sản phẩm').should('be.visible')
    fillProductForm(updatedProduct)
    clickUpdateProductButton()

    // Assert
    cy.wait('@' + updateProductRequest)
    cy.contains('Chỉnh sửa sản phẩm').should('not.exist')
  })

  it('TC_E2E_PRODUCT_004: Nên xóa sản phẩm thành công', () => {
    // Arrange
    arrangeDeleteProductRequest(1)

    // Action
    clickDeleteButtonOnRow(0)
    cy.contains('Xác nhận xóa').should('be.visible')
    cy.contains('Bạn có chắc chắn muốn xóa').should('be.visible')
    clickDeleteProductButton()

    // Assert
    cy.wait('@' + deleteProductRequest)
    cy.contains('Xác nhận xóa').should('not.exist')
  })

  it('TC_E2E_PRODUCT_005: Nên tìm kiếm sản phẩm thành công', () => {
    // Assert initial state
    cy.get(component.tableRow).should('have.length', 2)
    cy.contains('Laptop Dell XPS').should('be.visible')

    // Action - Search
    searchProduct('name', 'Laptop')
    cy.wait(500)

    // Assert - Search result
    cy.contains('Laptop Dell XPS').should('be.visible')

    // Action - Clear search
    clearSearch()
    cy.wait(500)

    // Assert - All products visible again
    cy.contains('Laptop Dell XPS').should('be.visible')
  })
})
