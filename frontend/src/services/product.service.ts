import type { Category, ProductRequest, ProductResponse } from "@/schema/product.schema";
import { BaseService } from "./base.service";

class ProductService extends BaseService {
    async create(product: ProductRequest): Promise<ProductResponse> {
        try {
            const response = await fetch(`${this.BACKEND_API}/products`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(product),
            });

            return await this.handleResponse<ProductResponse>(response, 'Tạo sản phẩm thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async getById(id: number): Promise<ProductResponse> {
        try {
            const response = await fetch(`${this.BACKEND_API}/products/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse<ProductResponse>(response, 'Lấy thông tin sản phẩm thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async getAll(category?: Category): Promise<ProductResponse[]> {
        try {
            const url = category
                ? `${this.BACKEND_API}/products?category=${category}`
                : `${this.BACKEND_API}/products`;

            const response = await fetch(url, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse<ProductResponse[]>(response, 'Lấy danh sách sản phẩm thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async getCategories(): Promise<Category[]> {
        try {
            const response = await fetch(`${this.BACKEND_API}/products/categories`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            return await this.handleResponse<Category[]>(response, 'Lấy danh sách danh mục thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async update(id: number, product: ProductRequest): Promise<ProductResponse> {
        try {
            const response = await fetch(`${this.BACKEND_API}/products/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(product),
            });

            return await this.handleResponse<ProductResponse>(response, 'Cập nhật sản phẩm thất bại');
        } catch (error) { this.handleFetchError(error); }
    }

    async delete(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.BACKEND_API}/products/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            if (!response.ok) {
                const text = await response.text();
                let message = 'Xóa sản phẩm thất bại';
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

export const productService = new ProductService();
