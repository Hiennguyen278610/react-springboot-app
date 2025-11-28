export class BaseService {
    protected BACKEND_API = import.meta.env.VITE_PUBLIC_API;

    protected getAuthHeaders(): HeadersInit {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }

    protected async handleResponse<T>(response: Response, errorMessage: string): Promise<T> {
        const text = await response.text();
        if (!text) throw new Error('Server không phản hồi dữ liệu');

        let data;
        try { data = JSON.parse(text); }
        catch { throw new Error('Phản hồi từ server không hợp lệ'); }

        if (!response.ok) throw new Error(data.message || errorMessage);
        return data as T;
    }

    protected handleFetchError(error: unknown): never {
        if (error instanceof TypeError && error.message === 'Failed to fetch')
            throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng hoặc server.');
        throw error;
    }
}
