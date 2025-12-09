import { describe, it, expect } from 'vitest';
import {
    validateProductPrice,
    MESSAGES,
    commonValidations
} from '@/utils/validation';

describe('Product Validation Utils', () => {
    describe('Product Price Validation', () => {
        it('Chấp nhận giá hợp lệ lớn hơn 0', () => {
            const result = validateProductPrice(100);
            expect(result.success).toBe(true);
        });

        it('Từ chối giá bằng 0', () => {
            const result = validateProductPrice(0);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PRODUCT.PRICE_MIN);
        });

        it('Từ chối giá âm', () => {
            const result = validateProductPrice(-100);
            expect(result.success).toBe(false);
        });

        it('Chấp nhận giá tối đa hợp lệ (999999999)', () => {
            const result = validateProductPrice(999999999);
            expect(result.success).toBe(true);
        });

        it('Từ chối giá vượt quá giới hạn', () => {
            const result = validateProductPrice(1000000000);
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PRODUCT.PRICE_MAX);
        });

        it('Chấp nhận giá thập phân', () => {
            const result = validateProductPrice(99.99);
            expect(result.success).toBe(true);
        });
    });

    describe('Product Name Validation', () => {
        it('Chấp nhận tên sản phẩm hợp lệ', () => {
            const result = commonValidations.productName.safeParse('iPhone 15 Pro');
            expect(result.success).toBe(true);
        });

        it('Từ chối tên ngắn hơn 3 ký tự', () => {
            const result = commonValidations.productName.safeParse('AB');
            expect(result.success).toBe(false);
        });

        it('Từ chối tên dài hơn 100 ký tự', () => {
            const result = commonValidations.productName.safeParse('A'.repeat(101));
            expect(result.success).toBe(false);
        });
    });

    describe('Quantity Validation', () => {
        it('Chấp nhận số lượng hợp lệ', () => {
            const result = commonValidations.quantity.safeParse(100);
            expect(result.success).toBe(true);
        });

        it('Chấp nhận số lượng bằng 0', () => {
            const result = commonValidations.quantity.safeParse(0);
            expect(result.success).toBe(true);
        });

        it('Từ chối số lượng âm', () => {
            const result = commonValidations.quantity.safeParse(-1);
            expect(result.success).toBe(false);
        });

        it('Từ chối số lượng vượt quá giới hạn', () => {
            const result = commonValidations.quantity.safeParse(100000);
            expect(result.success).toBe(false);
        });
    });

    describe('Description Validation', () => {
        it('Chấp nhận mô tả hợp lệ', () => {
            const result = commonValidations.description.safeParse('This is a product description');
            expect(result.success).toBe(true);
        });

        it('Chấp nhận mô tả rỗng', () => {
            const result = commonValidations.description.safeParse('');
            expect(result.success).toBe(true);
        });

        it('Chấp nhận mô tả null', () => {
            const result = commonValidations.description.safeParse(null);
            expect(result.success).toBe(true);
        });

        it('Từ chối mô tả dài hơn 500 ký tự', () => {
            const result = commonValidations.description.safeParse('A'.repeat(501));
            expect(result.success).toBe(false);
        });
    });
});
