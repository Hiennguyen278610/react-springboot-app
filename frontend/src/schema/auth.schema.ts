import { z } from 'zod';
import { userResponse, type UserResponse } from '@/schema/user.schema';
import { commonValidations } from '@/utils/validation';

export const loginRequest = z.object({
  username: commonValidations.username,
  password: commonValidations.password
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