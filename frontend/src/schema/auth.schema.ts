import { z } from 'zod';
import { userResponse, type UserResponse } from '@/schema/user.schema';

export const loginRequest = z.object({
  username: z.string()
    .min(1, "Tên đăng nhập không được để trống")
    .min(3, "Tên đăng nhập tối thiểu 3 kí tự")
    .max(50, "Tên đăng nhập tối đa 50 kí tự")
    .regex(/^[A-Za-z\d\-._]+$/, "Tên đăng nhập chỉ chứa a-z, A-Z, 0-9, -, ., _"),

  password: z.string()
    .min(1, "Mật khẩu không được để trống")
    .min(6, "Mật khẩu tối thiểu 6 kí tự")
    .max(100, "Mật khẩu tối đa 100 kí tự")
    .regex(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/, "Mật khẩu phải có cả chữ và số")
});

export const loginResponse = z.object({
  success: z.boolean(),
  message: z.string(),
  token: z.string(),
  userResponse: userResponse
});

export type LoginRequest = z.infer<typeof loginRequest>;
export type LoginResponse = z.infer<typeof loginResponse>;
export type { UserResponse };