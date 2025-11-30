import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProductPage from "@/page/admin/ProductPage"
import { productService } from "@/services/product.service"
import type { ProductResponse } from "@/schema/product.schema"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const scopeMatcher = (globalThis as typeof globalThis & { __shouldRunScope?: (tags: string[]) => boolean }).__shouldRunScope
const describeProductIntegration = (scopeMatcher?.(["product", "integration"]) ?? true) ? describe : describe.skip

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

describeProductIntegration("Product Page Integration", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

		describe("a) - ProductList & API integration", () => {
		it("TC_PRODUCT_001: Tải danh sách sản phẩm từ API và hiển thị bảng", async () => {
			// Arrange
			vi.spyOn(productService, "getAll").mockResolvedValue(baseProducts)
			renderProductPage()

			// Act
			const productName = await screen.findByText("Laptop Dell")

			// Assert
			expect(productName).toBeInTheDocument()
			expect(productService.getAll).toHaveBeenCalledWith()
		})

			it("TC_PRODUCT_002: Hiển thị trạng thái rỗng khi API trả về danh sách trống", async () => {
			// Arrange
			const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => { /* swallow error */ })
			vi.spyOn(productService, "getAll").mockRejectedValueOnce(new Error("Server lỗi"))
			renderProductPage()

			// Act
			const emptyState = await screen.findByText("Không có dữ liệu.")

			// Assert
			expect(emptyState).toBeInTheDocument()
			expect(productService.getAll).toHaveBeenCalledTimes(1)
			consoleErrorSpy.mockRestore()
		})
	})

		describe("b) - Product form create & edit", () => {
		it("TC_PRODUCT_003: Tạo sản phẩm mới thành công và refresh danh sách", async () => {
			// Arrange
			const user = userEvent.setup()
			const createdProduct: ProductResponse = {
				id: 2,
				name: "Tai nghe Sony",
				price: 1990000,
				quantity: 12,
				description: "Tai nghe chống ồn",
				category: "DIEN_TU",
			}
			const getAllSpy = vi.spyOn(productService, "getAll")
			getAllSpy
				.mockResolvedValueOnce(baseProducts)
				.mockResolvedValueOnce([...baseProducts, createdProduct])
				.mockResolvedValue([...baseProducts, createdProduct])
			const createSpy = vi.spyOn(productService, "create").mockResolvedValue(createdProduct)
			renderProductPage()
			await screen.findByText("Laptop Dell")

			// Act
			await user.click(screen.getByRole("button", { name: "Thêm sản phẩm" }))
			const nameInput = await screen.findByLabelText("Tên sản phẩm")
			const priceInput = screen.getByLabelText("Giá (VNĐ)") as HTMLInputElement
			const quantityInput = screen.getByLabelText("Số lượng") as HTMLInputElement
			const categorySelect = screen.getByLabelText("Danh mục") as HTMLSelectElement
			const descriptionInput = screen.getByLabelText("Mô tả")

			await user.type(nameInput, createdProduct.name)
			await user.clear(priceInput)
			await user.type(priceInput, String(createdProduct.price))
			await user.clear(quantityInput)
			await user.type(quantityInput, String(createdProduct.quantity))
			await user.selectOptions(categorySelect, createdProduct.category)
			await user.type(descriptionInput, createdProduct.description ?? "")
			await user.click(screen.getByRole("button", { name: "Tạo sản phẩm" }))

			// Assert
			await waitFor(() => expect(createSpy).toHaveBeenCalledWith({
				name: createdProduct.name,
				price: createdProduct.price,
				quantity: createdProduct.quantity,
				description: createdProduct.description,
				category: createdProduct.category,
			}))
			await waitFor(() => expect(getAllSpy).toHaveBeenCalledTimes(2))
			await screen.findByText("Tai nghe Sony")
		})

			it("TC_PRODUCT_004: Cập nhật sản phẩm thành công qua form chỉnh sửa", async () => {
			// Arrange
			const user = userEvent.setup()
			const updatedProduct: ProductResponse = {
				...baseProducts[0],
				price: 22900000,
				quantity: 8,
				description: "Laptop nâng cấp cấu hình",
			}
			const getAllSpy = vi.spyOn(productService, "getAll")
			getAllSpy
				.mockResolvedValueOnce(baseProducts)
				.mockResolvedValueOnce([updatedProduct])
				.mockResolvedValue([updatedProduct])
			const updateSpy = vi.spyOn(productService, "update").mockResolvedValue(updatedProduct)
			renderProductPage()
			await screen.findByText("Laptop Dell")
			const productRow = screen.getByRole("row", { name: /Laptop Dell/ })

			// Act
			const actionButtons = within(productRow).getAllByRole("button")
			await user.click(actionButtons[0])
			const priceInput = await screen.findByLabelText("Giá (VNĐ)") as HTMLInputElement
			const quantityInput = screen.getByLabelText("Số lượng") as HTMLInputElement
			const descriptionInput = screen.getByLabelText("Mô tả")
			await user.clear(priceInput)
			await user.type(priceInput, String(updatedProduct.price))
			await user.clear(quantityInput)
			await user.type(quantityInput, String(updatedProduct.quantity))
			await user.clear(descriptionInput)
			await user.type(descriptionInput, updatedProduct.description ?? "")
			await user.click(screen.getByRole("button", { name: "Cập nhật" }))

			// Assert
			await waitFor(() => expect(updateSpy).toHaveBeenCalledWith(updatedProduct.id, {
				name: updatedProduct.name,
				price: updatedProduct.price,
				quantity: updatedProduct.quantity,
				description: updatedProduct.description,
				category: updatedProduct.category,
			}))
			await waitFor(() => expect(getAllSpy).toHaveBeenCalledTimes(2))
			await waitFor(() => {
				expect(screen.getByText(/22\.900\.000/)).toBeInTheDocument()
			})
		})
	})

		describe("c) - Product detail dialog", () => {
		it("TC_PRODUCT_005: Hiển thị thông tin chi tiết sản phẩm khi mở dialog", async () => {
			// Arrange
			const user = userEvent.setup()
			vi.spyOn(productService, "getAll").mockResolvedValue(baseProducts)
			renderProductPage()
			await screen.findByText("Laptop Dell")
			const productRow = screen.getByRole("row", { name: /Laptop Dell/ })

			// Act
			const actionButtons = within(productRow).getAllByRole("button")
			await user.click(actionButtons[1])

			// Assert
			const dialogTitle = await screen.findByText("Chi tiết sản phẩm")
			expect(dialogTitle).toBeInTheDocument()
			const dialog = (dialogTitle.closest("[data-slot='dialog-content']") ?? document.body) as HTMLElement
			expect(within(dialog).getByText("Laptop Dell")).toBeInTheDocument()
			expect(within(dialog).getByText(/Điện tử/)).toBeInTheDocument()
		})
	})
})
