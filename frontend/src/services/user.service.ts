import type { UserRequest, UserResponse } from "@/schema/user.schema";
import { BaseService } from "./base.service";

class UserService extends BaseService {
    async create(user: UserRequest): Promise<UserResponse> {
        try {
            const response = await fetch(`${this.BACKEND_API}/users`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(user),
            });

            return await this.handleResponse<UserResponse>(response, 'Tạo người dùng thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async getById(id: number): Promise<UserResponse> {
        try {
            const response = await fetch(`${this.BACKEND_API}/users/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse<UserResponse>(response, 'Lấy thông tin người dùng thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async getAll(): Promise<UserResponse[]> {
        try {
            const response = await fetch(`${this.BACKEND_API}/users`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse<UserResponse[]>(response, 'Lấy danh sách người dùng thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async delete(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.BACKEND_API}/users/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const text = await response.text();
                let message = 'Xóa người dùng thất bại';
                if (text) {
                    try {
                        const data = JSON.parse(text);
                        message = data.message || message;
                    } catch { /* ignore */ }
                }
                throw new Error(message);
            }
        } catch (error) { this.handleFetchError(error); }
    }
}

export const userService = new UserService();
