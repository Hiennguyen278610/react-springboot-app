import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProductPage from "@/page/admin/ProductPage"
import { productService } from "@/services/product.service"
import type { ProductResponse } from "@/schema/product.schema"
import { beforeEach, describe, expect, it, vi } from "vitest"

const { mockGetAll, mockCreate, mockUpdate, mockDelete } = vi.hoisted(() => ({
	mockGetAll: vi.fn(),
	mockCreate: vi.fn(),
	mockUpdate: vi.fn(),
	mockDelete: vi.fn(),
}))

const scopeMatcher = (globalThis as typeof globalThis & { __shouldRunScope?: (tags: string[]) => boolean }).__shouldRunScope
const describeProductMock = (scopeMatcher?.(["product", "mock"]) ?? true) ? describe : describe.skip

vi.mock("@/services/product.service", () => ({
	productService: {
		getAll: mockGetAll,
		create: mockCreate,
		update: mockUpdate,
		delete: mockDelete,
	},
}))

const baseProducts: ProductResponse[] = [
	{
		id: 1,
		name: "Laptop Dell",
		price: 25000000,
		quantity: 5,
		description: "Laptop văn phòng",
		category: "DIEN_TU",
	},
]

const renderProductPage = () => render(<ProductPage />)

describeProductMock("Product Page Mock Tests", () => {
	beforeEach(() => {
		localStorage.clear()
		mockGetAll.mockReset()
		mockCreate.mockReset()
		mockUpdate.mockReset()
		mockDelete.mockReset()
		mockGetAll.mockResolvedValue(baseProducts)
	})

	describe("a) - Cấu hình mock cho CRUD productService", () => {
		it("TC_PRODUCT_001: Các phương thức productService được thay thế bằng mock function", () => {
			// Arrange
			// Act
			// Assert
			expect(vi.isMockFunction(productService.getAll)).toBe(true)
			expect(vi.isMockFunction(productService.create)).toBe(true)
			expect(vi.isMockFunction(productService.update)).toBe(true)
			expect(vi.isMockFunction(productService.delete)).toBe(true)
		})

	it("TC_PRODUCT_002: Cho phép cấu hình kết quả trả về cho mock getAll", async () => {
			// Arrange
			const products: ProductResponse[] = [
				{ id: 99, name: "Bàn phím cơ", price: 1200000, quantity: 20, description: "Phụ kiện", category: "DIEN_TU" },
			]
			mockGetAll.mockResolvedValueOnce(products)

			// Act
			const result = await productService.getAll()

			// Assert
			expect(result).toEqual(products)
			expect(mockGetAll).toHaveBeenCalledTimes(1)
		})
	})

	describe("b) - Kịch bản thành công và thất bại", () => {
	it("TC_PRODUCT_003: Render danh sách sản phẩm thành công khi mock getAll trả dữ liệu", async () => {
			// Arrange
			mockGetAll.mockResolvedValueOnce(baseProducts)
			renderProductPage()

			// Act
			const productName = await screen.findByText("Laptop Dell")

			// Assert
			expect(productName).toBeInTheDocument()
			expect(mockGetAll).toHaveBeenCalledTimes(1)
		})

	it("TC_PRODUCT_004: Hiển thị trạng thái rỗng khi mock getAll trả lỗi", async () => {
			// Arrange
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { /* swallow error */ })
			mockGetAll.mockRejectedValueOnce(new Error("Server lỗi"))
			renderProductPage()

			// Act
			const emptyState = await screen.findByText("Không có dữ liệu.")

			// Assert
			expect(emptyState).toBeInTheDocument()
			expect(mockGetAll).toHaveBeenCalledTimes(1)
			consoleErrorSpy.mockRestore()
		})
	})

	describe("c) - Kiểm tra tương tác với mock", () => {
	it("TC_PRODUCT_005: Gọi mockCreate với dữ liệu chính xác khi thêm sản phẩm", async () => {
			// Arrange
			const user = userEvent.setup()
			const newProduct: ProductResponse = {
				id: 2,
				name: "Chuột Logitech",
				price: 890000,
				quantity: 15,
				description: "Chuột không dây",
				category: "DIEN_TU",
			}
			mockGetAll
				.mockResolvedValueOnce(baseProducts)
				.mockResolvedValueOnce([...baseProducts, newProduct])
				.mockResolvedValue([...baseProducts, newProduct])
			mockCreate.mockResolvedValueOnce(newProduct)
			renderProductPage()
			await screen.findByText("Laptop Dell")

			// Act
			await user.click(screen.getByRole("button", { name: "Thêm sản phẩm" }))
			await user.type(await screen.findByLabelText("Tên sản phẩm"), newProduct.name)
			const priceInput = screen.getByLabelText("Giá (VNĐ)") as HTMLInputElement
			const quantityInput = screen.getByLabelText("Số lượng") as HTMLInputElement
			const categorySelect = screen.getByLabelText("Danh mục") as HTMLSelectElement
			const descriptionInput = screen.getByLabelText("Mô tả")
			await user.clear(priceInput)
			await user.type(priceInput, String(newProduct.price))
			await user.clear(quantityInput)
			await user.type(quantityInput, String(newProduct.quantity))
			await user.selectOptions(categorySelect, newProduct.category)
			await user.type(descriptionInput, newProduct.description ?? "")
			await user.click(screen.getByRole("button", { name: "Tạo sản phẩm" }))

			// Assert
			await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({
				name: newProduct.name,
				price: newProduct.price,
				quantity: newProduct.quantity,
				description: newProduct.description,
				category: newProduct.category,
			}))
			await waitFor(() => expect(mockGetAll).toHaveBeenCalledTimes(2))
		})

	it("TC_PRODUCT_006: Gọi mockDelete khi xác nhận xóa sản phẩm", async () => {
			// Arrange
			const user = userEvent.setup()
			const secondProduct: ProductResponse = {
				id: 3,
				name: "Loa Bluetooth",
				price: 1590000,
				quantity: 9,
				description: "Loa di động",
				category: "DIEN_TU",
			}
			mockGetAll.mockResolvedValueOnce([baseProducts[0], secondProduct])
			mockGetAll.mockResolvedValue([baseProducts[0]])
			mockDelete.mockResolvedValueOnce(undefined)
			renderProductPage()
			await screen.findByText("Loa Bluetooth")
			const productRow = screen.getByRole("row", { name: /Loa Bluetooth/ })

			// Act
			const actionButtons = within(productRow).getAllByRole("button")
			await user.click(actionButtons[2])
			await user.click(await screen.findByRole("button", { name: "Xóa sản phẩm" }))

			// Assert
			await waitFor(() => expect(mockDelete).toHaveBeenCalledWith(secondProduct.id))
			await waitFor(() => expect(mockGetAll).toHaveBeenCalledTimes(2))
		})
	})
})
