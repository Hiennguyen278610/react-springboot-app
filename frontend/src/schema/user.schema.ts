import { z } from 'zod';
import { commonValidations } from '@/utils/validation';

export const userResponse = z.object({
    id: z.number(),
    username: z.string(),
    mail: commonValidations.email
});

export const userRequest = z.object({
    username: commonValidations.username,
    password: commonValidations.password,
    mail: commonValidations.email
});

export type UserResponse = z.infer<typeof userResponse>;
export type UserRequest = z.infer<typeof userRequest>;
