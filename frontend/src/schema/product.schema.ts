import { z } from 'zod';
import { commonValidations } from '@/utils/validation';

export const Category = {
    DIEN_TU: 'DIEN_TU',
    THOI_TRANG: 'THOI_TRANG',
    GIA_DUNG: 'GIA_DUNG',
    THUC_PHAM: 'THUC_PHAM',
    SAC_DEP: 'SAC_DEP',
    THE_THAO: 'THE_THAO',
    KHAC: 'KHAC',
} as const;

export type Category = typeof Category[keyof typeof Category];

export const CategoryDisplayNames: Record<Category, string> = {
    DIEN_TU: 'Điện tử',
    THOI_TRANG: 'Thời trang',
    GIA_DUNG: 'Gia dụng',
    THUC_PHAM: 'Thực phẩm',
    SAC_DEP: 'Sắc đẹp',
    THE_THAO: 'Thể thao',
    KHAC: 'Khác',
};

const categorySchema = z.enum([
    'DIEN_TU',
    'THOI_TRANG',
    'GIA_DUNG',
    'THUC_PHAM',
    'SAC_DEP',
    'THE_THAO',
    'KHAC'
], { message: 'Danh mục không hợp lệ' });

export const productResponse = z.object({
    id: z.number(),
    name: z.string(),
    price: z.number(),
    quantity: z.number(),
    description: z.string().nullable(),
    category: categorySchema,
});

export const productRequest = z.object({
    name: commonValidations.productName,
    price: commonValidations.price,
    quantity: commonValidations.quantity,
    description: commonValidations.description,
    category: categorySchema,
});

export type ProductResponse = z.infer<typeof productResponse>;
export type ProductRequest = z.infer<typeof productRequest>;
