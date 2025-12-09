import { authService } from "@/services/auth.service"
import type { LoginRequest, LoginResponse, UserResponse } from "@/schema/auth.schema"
import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("@/services/auth.service")
const mockService = vi.mocked(authService)

// Dữ liệu mẫu
const mockLoginRequest: LoginRequest = {
	username: "tester",
	password: "Test123",
}

const mockUser: UserResponse = {
	id: 1,
	username: "tester",
	mail: "tester@example.com",
}

const mockLoginResponse: LoginResponse = {
	success: true,
	message: "Đăng nhập thành công",
	token: "mock-jwt-token",
	userResponse: mockUser
}

describe("Login Mock Tests", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	describe("a) Mock Auth operations", () => {
		it("TC_MOCK_001: Mock Login - Đăng nhập thành công", async () => {
			// Arrange
			mockService.login.mockResolvedValue(mockLoginResponse)

			// Act
			const result = await authService.login(mockLoginRequest)

			// Assert
			expect(result).toEqual(mockLoginResponse)
			expect(result.token).toBe("mock-jwt-token")
			expect(mockService.login).toHaveBeenCalledWith(mockLoginRequest)
		})

		it("TC_MOCK_002: Mock GetCurrentUser - Lấy thông tin user hiện tại", async () => {
			// Arrange
			mockService.getCurrentUser.mockResolvedValue(mockUser)

			// Act
			const result = await authService.getCurrentUser()

			// Assert
			expect(result).toEqual(mockUser)
			expect(result.username).toBe("tester")
		})
	})

	describe("b) Success và Failure scenarios", () => {
		it("TC_MOCK_003: Success - Login trả về token hợp lệ", async () => {
			// Arrange
			mockService.login.mockResolvedValue(mockLoginResponse)

			// Act
			const result = await authService.login(mockLoginRequest)

			// Assert
			expect(result.success).toBe(true)
			expect(result.token).toBeDefined()
		})

		it("TC_MOCK_004: Failure - Sai mật khẩu", async () => {
			// Arrange
			mockService.login.mockRejectedValue(new Error("Mật khẩu không chính xác"))

			// Act & Assert
			await expect(authService.login(mockLoginRequest)).rejects.toThrow("Mật khẩu không chính xác")
		})

		it("TC_MOCK_005: Failure - Tài khoản không tồn tại", async () => {
			// Arrange
			mockService.login.mockRejectedValue(new Error("Tài khoản không tồn tại"))

			// Act & Assert
			await expect(authService.login(mockLoginRequest)).rejects.toThrow("Tài khoản không tồn tại")
		})

		it("TC_MOCK_006: Failure - Token không hợp lệ khi lấy user", async () => {
			// Arrange
			mockService.getCurrentUser.mockRejectedValue(new Error("Token không hợp lệ"))

			// Act & Assert
			await expect(authService.getCurrentUser()).rejects.toThrow("Token không hợp lệ")
		})
	})

	describe("c) Verify mock calls", () => {
		it("TC_MOCK_007: Verify - Login được gọi với đúng tham số", async () => {
			// Arrange
			mockService.login.mockResolvedValue(mockLoginResponse)
			const credentials = { username: "admin", password: "Admin123" }

			// Act
			await authService.login(credentials)

			// Assert
			expect(mockService.login).toHaveBeenCalledWith(credentials)
		})

		it("TC_MOCK_008: Verify - Service được gọi đúng số lần", async () => {
			// Arrange
			mockService.getCurrentUser.mockResolvedValue(mockUser)

			// Act
			await authService.getCurrentUser()
			await authService.getCurrentUser()

			// Assert
			expect(mockService.getCurrentUser).toHaveBeenCalledTimes(2)
		})

		it("TC_MOCK_009: Verify - Tất cả service đều là mock function", () => {
			// Assert
			expect(vi.isMockFunction(authService.login)).toBe(true)
			expect(vi.isMockFunction(authService.getCurrentUser)).toBe(true)
		})
	})
})

