describe('Product E2E Tests', () => {
  beforeEach(() => {
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

    cy.visit('http://localhost:3000/login')
    cy.get('[data-testid="username-input"]').type('Hyan2005')
    cy.get('[data-testid="password-input"]').type('sugoi123')
    cy.get('[data-testid="login-button"]').click()

    cy.wait('@loginRequest')
    cy.wait('@meRequest')

    cy.intercept('GET', '**/api/products*', {
      statusCode: 200,
      body: [
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
    }).as('getProducts')

    cy.visit('http://localhost:3000/home/products')
    cy.wait('@getProducts')
  })

  it('TC_E2E_PRODUCT_001: Nên tạo sản phẩm mới thành công', () => {
    cy.intercept('POST', '**/api/products', {
      statusCode: 201,
      body: {
        id: 3,
        name: 'MacBook Pro',
        price: 35000000,
        quantity: 5,
        description: 'Laptop Apple cao cấp',
        category: 'DIEN_TU'
      }
    }).as('createProduct')

    cy.contains('button', /Thêm sản phẩm|thêm|add/i).click()

    cy.contains('Thêm sản phẩm mới').should('be.visible')

    cy.get('#name').type('MacBook Pro')
    cy.get('#price').type('35000000')
    cy.get('#quantity').type('5')
    cy.get('#description').type('Laptop Apple cao cấp')
    cy.get('#category').select('DIEN_TU')

    cy.contains('button', /Tạo sản phẩm|tạo/i).click()

    cy.wait('@createProduct')

    cy.contains('Thêm sản phẩm mới').should('not.exist')
  })

  it('TC_E2E_PRODUCT_002: Nên hiển thị danh sách sản phẩm', () => {
    cy.get('table tbody tr').should('have.length', 2)
    
    cy.get('table tbody tr').first().within(() => {
      cy.contains('td', 'Laptop Dell XPS').should('be.visible')
      cy.contains('td', '10').should('be.visible')
    })

    cy.get('table tbody tr').last().within(() => {
      cy.contains('td', 'iPhone 15').should('be.visible')
      cy.contains('td', '5').should('be.visible')
    })
  })

  it('TC_E2E_PRODUCT_003: Nên cập nhật sản phẩm thành công', () => {
    cy.intercept('PUT', '**/api/products/1', {
      statusCode: 200,
      body: {
        id: 1,
        name: 'Laptop Dell XPS 15',
        price: 18000000,
        quantity: 8,
        description: 'Laptop cao cấp - updated',
        category: 'DIEN_TU'
      }
    }).as('updateProduct')

    cy.get('table tbody tr').first().within(() => {
      cy.contains('Laptop Dell XPS').should('be.visible')
      cy.get('button svg').first().parent().click()
    })

    cy.contains('Chỉnh sửa sản phẩm').should('be.visible')

    cy.get('#name').clear().type('Laptop Dell XPS 15')
    cy.get('#price').clear().type('18000000')
    cy.get('#quantity').clear().type('8')
    cy.get('#description').clear().type('Laptop cao cấp - updated')

    cy.contains('button', /Cập nhật|cập nhật/i).click()

    cy.wait('@updateProduct')

    cy.contains('Chỉnh sửa sản phẩm').should('not.exist')
  })

  it('TC_E2E_PRODUCT_004: Nên xóa sản phẩm thành công', () => {
    cy.intercept('DELETE', '**/api/products/1', {
      statusCode: 200,
      body: { success: true }
    }).as('deleteProduct')

    cy.get('table tbody tr').first().within(() => {
      cy.contains('Laptop Dell XPS').should('be.visible')
      cy.get('button').last().click()
    })

    cy.contains('Xác nhận xóa').should('be.visible')
    cy.contains('Bạn có chắc chắn muốn xóa').should('be.visible')

    cy.contains('button', /Xóa sản phẩm|xóa/i).click()

    cy.wait('@deleteProduct')

    cy.contains('Xác nhận xóa').should('not.exist')
  })

  it('TC_E2E_PRODUCT_005: Nên tìm kiếm sản phẩm thành công', () => {
    cy.get('table tbody tr').should('have.length', 2)
    cy.contains('Laptop Dell XPS').should('be.visible')

    cy.get('select').first().select('name')

    cy.get('input[placeholder="Tìm kiếm..."]').type('Laptop')

    cy.wait(500)

    cy.contains('Laptop Dell XPS').should('be.visible')

    cy.get('input[placeholder="Tìm kiếm..."]').clear()

    cy.wait(500)

    cy.contains('Laptop Dell XPS').should('be.visible')
  })
})
