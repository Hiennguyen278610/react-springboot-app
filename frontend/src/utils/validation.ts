import { z } from "zod";

export const PATTERNS = {
    USERNAME: /^[A-Za-z\d\-._]+$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
    EMAIL: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
};

export const MESSAGES = {
    REQUIRED: "Trường này không được để trống",
    USERNAME: {
        MIN: "Tên đăng nhập tối thiểu 3 kí tự",
        MAX: "Tên đăng nhập tối đa 50 kí tự",
        PATTERN: "Tên đăng nhập chỉ chứa a-z, A-Z, 0-9, -, ., _",
    },
    PASSWORD: {
        MIN: "Mật khẩu tối thiểu 6 kí tự",
        MAX: "Mật khẩu tối đa 100 kí tự",
        PATTERN: "Mật khẩu phải có cả chữ và số",
    },
    EMAIL: {
        INVALID: "Email không hợp lệ",
    },
    PRODUCT: {
        NAME_MIN: "Tên sản phẩm tối thiểu 3 ký tự",
        NAME_MAX: "Tên sản phẩm tối đa 100 ký tự",
        PRICE_MIN: "Giá sản phẩm phải lớn hơn 0",
        PRICE_MAX: "Giá sản phẩm tối đa 999,999,999",
        QUANTITY_MIN: "Số lượng không được âm",
        QUANTITY_MAX: "Số lượng tối đa 99,999",
        DESC_MAX: "Mô tả tối đa 500 ký tự",
    },
};

export const commonValidations = {
    username: z.string()
        .min(1, MESSAGES.REQUIRED)
        .min(3, MESSAGES.USERNAME.MIN)
        .max(50, MESSAGES.USERNAME.MAX)
        .regex(PATTERNS.USERNAME, MESSAGES.USERNAME.PATTERN),

    password: z.string()
        .min(1, MESSAGES.REQUIRED)
        .min(6, MESSAGES.PASSWORD.MIN)
        .max(100, MESSAGES.PASSWORD.MAX)
        .regex(PATTERNS.PASSWORD, MESSAGES.PASSWORD.PATTERN),

    email: z.string()
        .min(1, MESSAGES.REQUIRED)
        .regex(PATTERNS.EMAIL, MESSAGES.EMAIL.INVALID),
        
    productName: z.string()
        .min(1, MESSAGES.REQUIRED)
        .min(3, MESSAGES.PRODUCT.NAME_MIN)
        .max(100, MESSAGES.PRODUCT.NAME_MAX),
        
    price: z.number({ message: MESSAGES.REQUIRED })
        .gt(0, MESSAGES.PRODUCT.PRICE_MIN)
        .max(999999999, MESSAGES.PRODUCT.PRICE_MAX),
        
    quantity: z.number({ message: MESSAGES.REQUIRED })
        .min(0, MESSAGES.PRODUCT.QUANTITY_MIN)
        .max(99999, MESSAGES.PRODUCT.QUANTITY_MAX),
        
    description: z.string()
        .max(500, MESSAGES.PRODUCT.DESC_MAX)
        .optional()
        .nullable(),
};

export const validateUsername = (username: string) => commonValidations.username.safeParse(username);
export const validatePassword = (password: string) => commonValidations.password.safeParse(password);
export const validateEmail = (email: string) => commonValidations.email.safeParse(email);
export const validateProductPrice = (price: number) => commonValidations.price.safeParse(price);
