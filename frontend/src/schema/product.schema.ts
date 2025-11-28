import { z } from 'zod';

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
    name: z.string()
        .min(1, 'Tên sản phẩm không được để trống')
        .min(3, 'Tên sản phẩm tối thiểu 3 ký tự')
        .max(100, 'Tên sản phẩm tối đa 100 ký tự'),

    price: z.number({ message: 'Giá sản phẩm không được để trống' })
        .gt(0, 'Giá sản phẩm phải lớn hơn 0')
        .max(999999999, 'Giá sản phẩm tối đa 999,999,999'),

    quantity: z.number({ message: 'Số lượng không được để trống' })
        .min(0, 'Số lượng không được âm')
        .max(99999, 'Số lượng tối đa 99,999'),

    description: z.string()
        .max(500, 'Mô tả tối đa 500 ký tự')
        .optional()
        .nullable(),

    category: categorySchema,
});

export type ProductResponse = z.infer<typeof productResponse>;
export type ProductRequest = z.infer<typeof productRequest>;
