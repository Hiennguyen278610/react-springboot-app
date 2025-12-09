import { productService } from "@/services/product.service"
import type { ProductResponse, ProductRequest } from "@/schema/product.schema"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/services/product.service")
const mockService = vi.mocked(productService)

// Dữ liệu mẫu
const mockProduct: ProductResponse = {
	id: 1,
	name: "Laptop Dell",
	price: 25000000,
	quantity: 5,
	description: "Laptop văn phòng",
	category: "DIEN_TU",
}

describe("Product Mock Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("a) Mock CRUD operations", () => {
		it("TC_MOCK_001: Mock Create - Tạo sản phẩm thành công", async () => {
			// Arrange - Cấu hình mock trả về sản phẩm mới
			mockService.create.mockResolvedValue(mockProduct)
			const newProduct: ProductRequest = {
				name: "Laptop Dell",
				price: 25000000,
				quantity: 5,
				description: "Laptop văn phòng",
				category: "DIEN_TU",
			}

			// Act - Gọi service
			const result = await productService.create(newProduct)

			// Assert - Kiểm tra kết quả
			expect(result).toEqual(mockProduct)
			expect(mockService.create).toHaveBeenCalledWith(newProduct)
		})

		it("TC_MOCK_002: Mock Read - Lấy danh sách sản phẩm", async () => {
			// Arrange
			const products: ProductResponse[] = [mockProduct]
			mockService.getAll.mockResolvedValue(products)

			// Act
			const result = await productService.getAll()

			// Assert
			expect(result).toEqual(products)
			expect(result).toHaveLength(1)
		})

		it("TC_MOCK_003: Mock Update - Cập nhật sản phẩm", async () => {
			// Arrange
			const updatedProduct = { ...mockProduct, name: "Laptop HP", price: 30000000 }
			mockService.update.mockResolvedValue(updatedProduct)

			// Act
			const result = await productService.update(1, { name: "Laptop HP", price: 30000000 } as ProductRequest)

			// Assert
			expect(result.name).toBe("Laptop HP")
			expect(result.price).toBe(30000000)
		})

		it("TC_MOCK_004: Mock Delete - Xóa sản phẩm", async () => {
			// Arrange
			mockService.delete.mockResolvedValue(undefined)

			// Act
			await productService.delete(1)

			// Assert
			expect(mockService.delete).toHaveBeenCalledWith(1)
		})
	})

	describe("b) Success và Failure scenarios", () => {
		it("TC_MOCK_005: Success - API trả về dữ liệu thành công", async () => {
			// Arrange
			mockService.getAll.mockResolvedValue([mockProduct])

			// Act
			const result = await productService.getAll()

			// Assert
			expect(result).toBeDefined()
			expect(result[0].id).toBe(1)
		})

		it("TC_MOCK_006: Failure - API ném lỗi khi server lỗi", async () => {
			// Arrange
			mockService.getAll.mockRejectedValue(new Error("Server lỗi 500"))

			// Act & Assert
			await expect(productService.getAll()).rejects.toThrow("Server lỗi 500")
		})

		it("TC_MOCK_007: Failure - Không tìm thấy sản phẩm", async () => {
			// Arrange
			mockService.getAll.mockResolvedValue([])

			// Act
			const result = await productService.getAll()

			// Assert
			expect(result).toEqual([])
			expect(result).toHaveLength(0)
		})
	})

	describe("c) Verify mock calls", () => {
		it("TC_MOCK_008: Verify - Service được gọi đúng số lần", async () => {
			// Arrange
			mockService.getAll.mockResolvedValue([mockProduct])

			// Act
			await productService.getAll()
			await productService.getAll()

			// Assert
			expect(mockService.getAll).toHaveBeenCalledTimes(2)
		})

		it("TC_MOCK_009: Verify - Service được gọi với đúng tham số", async () => {
			// Arrange
			mockService.delete.mockResolvedValue(undefined)

			// Act
			await productService.delete(99)

			// Assert
			expect(mockService.delete).toHaveBeenCalledWith(99)
		})

		it("TC_MOCK_010: Verify - Tất cả service đều là mock function", () => {
			// Assert
			expect(vi.isMockFunction(productService.getAll)).toBe(true)
			expect(vi.isMockFunction(productService.create)).toBe(true)
			expect(vi.isMockFunction(productService.update)).toBe(true)
			expect(vi.isMockFunction(productService.delete)).toBe(true)
		})
	})
})
