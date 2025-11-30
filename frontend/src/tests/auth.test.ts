import { describe, it, expect } from 'vitest';
import { 
    validateUsername, 
    validatePassword, 
    validateEmail, 
    PATTERNS,
    MESSAGES
} from '../utils/validation';

describe('Auth / User Validation Utils', () => {
    describe('Username Validation', () => {
        it('Chấp nhận username hợp lệ với chữ và số', () => {
            const result = validateUsername('user123');
            expect(result.success).toBe(true);
        });

        it('Chấp nhận username với ký tự đặc biệt (-, ., _)', () => {
            const result = validateUsername('user.name_123');
            expect(result.success).toBe(true);
        });

        it('Từ chối username rỗng', () => {
            const result = validateUsername('');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toContain('trống');
        });

        it('Từ chối username ngắn hơn 3 ký tự', () => {
            const result = validateUsername('ab');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.USERNAME.MIN);
        });

        it('Từ chối username dài hơn 50 ký tự', () => {
            const result = validateUsername('a'.repeat(51));
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.USERNAME.MAX);
        });

        it('Từ chối username với ký tự không hợp lệ (@, #, $)', () => {
            const result = validateUsername('user@name');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.USERNAME.PATTERN);
        });

        it('Chấp nhận username đúng 3 ký tự', () => {
            const result = validateUsername('abc');
            expect(result.success).toBe(true);
        });

        it('Chấp nhận username đúng 50 ký tự', () => {
            const result = validateUsername('a'.repeat(50));
            expect(result.success).toBe(true);
        });
    });

    describe('Password Validation', () => {
        it('Chấp nhận mật khẩu hợp lệ với chữ và số', () => {
            const result = validatePassword('pass123');
            expect(result.success).toBe(true);
        });

        it('Từ chối mật khẩu rỗng', () => {
            const result = validatePassword('');
            expect(result.success).toBe(false);
        });

        it('Từ chối mật khẩu ngắn hơn 6 ký tự', () => {
            const result = validatePassword('ab1');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PASSWORD.MIN);
        });

        it('Từ chối mật khẩu dài hơn 100 ký tự', () => {
            const result = validatePassword('a1' + 'b'.repeat(100));
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PASSWORD.MAX);
        });

        it('Từ chối mật khẩu chỉ có chữ (không có số)', () => {
            const result = validatePassword('password');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PASSWORD.PATTERN);
        });

        it('Từ chối mật khẩu chỉ có số (không có chữ)', () => {
            const result = validatePassword('123456');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PASSWORD.PATTERN);
        });

        it('Từ chối mật khẩu có ký tự đặc biệt', () => {
            const result = validatePassword('pass@123');
            expect(result.success).toBe(false);
            expect(result.error?.issues[0].message).toBe(MESSAGES.PASSWORD.PATTERN);
        });

        it('Chấp nhận mật khẩu đúng 6 ký tự', () => {
            const result = validatePassword('abc123');
            expect(result.success).toBe(true);
        });

        it('Chấp nhận mật khẩu đúng 100 ký tự', () => {
            const result = validatePassword('abc123' + 'a'.repeat(94));
            expect(result.success).toBe(true);
        });
    });

    describe('Email Validation', () => {
        it('Chấp nhận email hợp lệ', () => {
            const result = validateEmail('test@example.com');
            expect(result.success).toBe(true);
        });

        it('Chấp nhận email với subdomain', () => {
            const result = validateEmail('user@mail.example.com');
            expect(result.success).toBe(true);
        });

        it('Từ chối email rỗng', () => {
            const result = validateEmail('');
            expect(result.success).toBe(false);
        });

        it('Từ chối email không có @', () => {
            const result = validateEmail('testexample.com');
            expect(result.success).toBe(false);
        });

        it('Từ chối email không có domain', () => {
            const result = validateEmail('test@');
            expect(result.success).toBe(false);
        });

        it('Chấp nhận email với dấu gạch ngang và số', () => {
            const result = validateEmail('user-123@test.vn');
            expect(result.success).toBe(true);
        });
    });

    describe('Regex Patterns', () => {
        it('Pattern USERNAME hoạt động đúng', () => {
            expect(PATTERNS.USERNAME.test('user123')).toBe(true);
            expect(PATTERNS.USERNAME.test('user.name_123')).toBe(true);
            expect(PATTERNS.USERNAME.test('user@name')).toBe(false);
        });

        it('Pattern PASSWORD hoạt động đúng', () => {
            expect(PATTERNS.PASSWORD.test('pass123')).toBe(true);
            expect(PATTERNS.PASSWORD.test('password')).toBe(false);
            expect(PATTERNS.PASSWORD.test('123456')).toBe(false);
        });

        it('Pattern EMAIL hoạt động đúng', () => {
            expect(PATTERNS.EMAIL.test('test@example.com')).toBe(true);
            expect(PATTERNS.EMAIL.test('invalid-email')).toBe(false);
        });
    });
});
