import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuthProvider } from "@/context/AuthContext"
import LoginPage from "@/page/admin/LoginPage"
import { authService } from "@/services/auth.service"
import type { LoginResponse } from "@/schema/auth.schema"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const scopeMatcher = (globalThis as typeof globalThis & { __shouldRunScope?: (tags: string[]) => boolean }).__shouldRunScope
const describeLoginIntegration = (scopeMatcher?.(["login", "integration"]) ?? true) ? describe : describe.skip

const HOME_TEST_ID = "home-page"

const renderLoginPage = (routeState?: { error?: string }) => {
	return render(
		<AuthProvider>
			<MemoryRouter initialEntries={[{ pathname: "/login", state: routeState }]}
				initialIndex={0}
			>
				<Routes>
					<Route path="/login" element={<LoginPage />} />
					<Route path="/home" element={<div data-testid={HOME_TEST_ID}>Home</div>} />
				</Routes>
			</MemoryRouter>
		</AuthProvider>
	)
}

describeLoginIntegration("Login Page Integration", () => {
	beforeEach(() => {
		localStorage.clear()
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe("a) - Rendering & user interactions", () => {
		it("TC_LOGIN_001: Hiển thị đầy đủ các trường của form login", () => {
			// Arrange
			renderLoginPage()

			// Act
			const usernameInput = screen.getByTestId("username-input")
			const passwordInput = screen.getByTestId("password-input")
			const loginButton = screen.getByTestId("login-button")

			// Assert
			expect(usernameInput).toBeInTheDocument()
			expect(passwordInput).toBeInTheDocument()
			expect(loginButton).toBeInTheDocument()
			expect(loginButton).not.toBeDisabled()
		})

		it("TC_LOGIN_002: Cho phép người dùng nhập username và password", async () => {
			// Arrange
			const user = userEvent.setup()
			renderLoginPage()
			const usernameInput = screen.getByTestId("username-input") as HTMLInputElement
			const passwordInput = screen.getByTestId("password-input") as HTMLInputElement

			// Act
			await user.type(usernameInput, "tester")
			await user.type(passwordInput, "Test123")

			// Assert
			expect(usernameInput.value).toBe("tester")
			expect(passwordInput.value).toBe("Test123")
		})
	})

		describe("b) - Form submission & API calls", () => {
		it("TC_LOGIN_003: Gọi API đăng nhập thành công và chuyển hướng người dùng", async () => {
			// Arrange
			const user = userEvent.setup()
			const loginResponse: LoginResponse = {
				success: true,
				message: "Đăng nhập thành công",
				token: "fake-token",
				userResponse: {
					id: 1,
					username: "tester",
					mail: "tester@example.com"
				}
			}
			const loginSpy = vi.spyOn(authService, "login").mockResolvedValue(loginResponse)
			const getCurrentUserSpy = vi.spyOn(authService, "getCurrentUser").mockResolvedValue(loginResponse.userResponse)
			renderLoginPage()

			await user.type(screen.getByTestId("username-input"), "tester")
			await user.type(screen.getByTestId("password-input"), "Test123")

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => expect(loginSpy).toHaveBeenCalledWith({ username: "tester", password: "Test123" }))
			await waitFor(() => expect(getCurrentUserSpy).toHaveBeenCalledTimes(1))
			await waitFor(() => expect(screen.getByTestId(HOME_TEST_ID)).toBeInTheDocument())
			expect(localStorage.getItem("token")).toBe("fake-token")
		})

		it("TC_LOGIN_004: Không gọi API khi form không hợp lệ", async () => {
			// Arrange
			const user = userEvent.setup()
			const loginSpy = vi.spyOn(authService, "login").mockResolvedValue({} as LoginResponse)
			renderLoginPage()

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => expect(screen.getByTestId("username-error")).toBeInTheDocument())
			expect(loginSpy).not.toHaveBeenCalled()
		})
	})

		describe("c) - Error handling & thông điệp phản hồi", () => {
		it("TC_LOGIN_005: Hiển thị lỗi từ state của router khi được chuyển tiếp", () => {
			// Arrange
			const message = "Phiên đăng nhập đã hết hạn"
			renderLoginPage({ error: message })

			// Act
			const errorLabel = screen.getByTestId("login-message")

			// Assert
			expect(errorLabel).toBeInTheDocument()
			expect(errorLabel).toHaveTextContent(message)
		})

		it("TC_LOGIN_006: Hiển thị thông báo lỗi khi API đăng nhập thất bại", async () => {
			// Arrange
			const user = userEvent.setup()
			const errorMessage = "Sai mật khẩu"
			vi.spyOn(authService, "login").mockRejectedValue(new Error(errorMessage))
			renderLoginPage()
			await user.type(screen.getByTestId("username-input"), "tester")
			await user.type(screen.getByTestId("password-input"), "wrongpass1")

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => {
				expect(screen.getByTestId("login-message")).toHaveTextContent(errorMessage)
			})
		})
	})
})
