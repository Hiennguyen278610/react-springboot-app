import type { LoginRequest, LoginResponse, UserResponse } from "@/schema/auth.schema";
import { BaseService } from "./base.service";

class AuthService extends BaseService {
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        try {
            const response = await fetch(`${this.BACKEND_API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

            return await this.handleResponse<LoginResponse>(response, 'Đăng nhập thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async getCurrentUser(): Promise<UserResponse> {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token không tồn tại hoặc không hợp lệ');

        try {
            const response = await fetch(`${this.BACKEND_API}/auth/me`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            });

            return await this.handleResponse<UserResponse>(response, 'Lấy thông tin người dùng thất bại');
        } catch (error) { this.handleFetchError(error); }
    }
}

export const authService = new AuthService();