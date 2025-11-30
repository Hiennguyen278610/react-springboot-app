import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoginPage from "@/page/admin/LoginPage"
import { authService } from "@/services/auth.service"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import { beforeEach, describe, expect, it, vi } from "vitest"

const HOME_TEST_ID = "home-page"

const { mockLogin, mockGetCurrentUser, mockRefreshUser, mockLogout } = vi.hoisted(() => ({
	mockLogin: vi.fn(),
	mockGetCurrentUser: vi.fn(),
	mockRefreshUser: vi.fn(),
	mockLogout: vi.fn(),
}))

const scopeMatcher = (globalThis as typeof globalThis & { __shouldRunScope?: (tags: string[]) => boolean }).__shouldRunScope
const describeLoginMock = (scopeMatcher?.(["login", "mock"]) ?? true) ? describe : describe.skip

vi.mock("@/services/auth.service", () => ({
	authService: {
		login: mockLogin,
		getCurrentUser: mockGetCurrentUser,
	},
}))

vi.mock("@/context/AuthContext", () => ({
	useAuth: () => ({
		currentUser: null,
		loading: false,
		error: null,
		refreshUser: mockRefreshUser,
		logout: mockLogout,
	}),
}))

const renderLoginPage = () => render(
	<MemoryRouter initialEntries={["/login"]}>
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/home" element={<div data-testid={HOME_TEST_ID}>Home</div>} />
		</Routes>
	</MemoryRouter>
)

describeLoginMock("Login Page Mock Tests", () => {
	beforeEach(() => {
		localStorage.clear()
		mockLogin.mockReset()
		mockGetCurrentUser.mockReset()
		mockRefreshUser.mockReset()
		mockLogout.mockReset()
		mockRefreshUser.mockResolvedValue(undefined)
	})

	describe("a) - Thiết lập mock cho authService.login", () => {
		it("TC_LOGIN_001: Sử dụng mock function thay cho implementation thật", () => {
			// Arrange
			// Act
			// Assert
			expect(vi.isMockFunction(authService.login)).toBe(true)
		})

		it("TC_LOGIN_002: Cho phép cấu hình giá trị trả về của mock", async () => {
			// Arrange
			const response = { success: true, message: "OK", token: "mock-token", userResponse: { id: 1, username: "mock", mail: "mock@example.com" } }
			mockLogin.mockResolvedValueOnce(response)

			// Act
			const result = await authService.login({ username: "mock", password: "Mock123" })

			// Assert
			expect(result).toBe(response)
			expect(mockLogin).toHaveBeenCalledWith({ username: "mock", password: "Mock123" })
		})
	})

		describe("b) - Kịch bản thành công và thất bại với mock", () => {
		it("TC_LOGIN_003: Điều hướng về trang home khi mock login trả về thành công", async () => {
			// Arrange
			const user = userEvent.setup()
			mockLogin.mockResolvedValueOnce({ success: true, message: "Đăng nhập thành công", token: "mock-token", userResponse: { id: 1, username: "tester", mail: "tester@example.com" } })
			renderLoginPage()

			await user.type(screen.getByTestId("username-input"), "tester")
			await user.type(screen.getByTestId("password-input"), "Test123")

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => expect(screen.getByTestId(HOME_TEST_ID)).toBeInTheDocument())
			expect(localStorage.getItem("token")).toBe("mock-token")
		})

		it("TC_LOGIN_004: Hiển thị thông báo lỗi khi mock login trả về reject", async () => {
			// Arrange
			const user = userEvent.setup()
			mockLogin.mockRejectedValueOnce(new Error("Sai thông tin"))
			renderLoginPage()
			await user.type(screen.getByTestId("username-input"), "tester")
			await user.type(screen.getByTestId("password-input"), "Wrong123")

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => expect(screen.getByTestId("login-message")).toHaveTextContent("Sai thông tin"))
		})
	})

		describe("c) - Kiểm tra tương tác với mock", () => {
		it("TC_LOGIN_005: Gọi authService.login với đúng dữ liệu đầu vào", async () => {
			// Arrange
			const user = userEvent.setup()
			mockLogin.mockResolvedValueOnce({ success: true, message: "Đăng nhập thành công", token: "mock-token", userResponse: { id: 1, username: "tester", mail: "tester@example.com" } })
			renderLoginPage()
			await user.type(screen.getByTestId("username-input"), "tester")
			await user.type(screen.getByTestId("password-input"), "Test123")

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => expect(mockLogin).toHaveBeenCalledWith({ username: "tester", password: "Test123" }))
		})

		it("TC_LOGIN_006: Không gọi refreshUser khi đăng nhập thất bại", async () => {
			// Arrange
			const user = userEvent.setup()
			mockLogin.mockRejectedValueOnce(new Error("Sai thông tin"))
			renderLoginPage()
			await user.type(screen.getByTestId("username-input"), "tester")
			await user.type(screen.getByTestId("password-input"), "Wrong123")

			// Act
			await user.click(screen.getByTestId("login-button"))

			// Assert
			await waitFor(() => expect(screen.getByTestId("login-message")).toBeInTheDocument())
			expect(mockRefreshUser).not.toHaveBeenCalled()
		})
	})
})
