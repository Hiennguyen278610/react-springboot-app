import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { userService } from "@/services/user.service";
import { userRequest, type UserRequest } from "@/schema/user.schema";
import { ZodError } from "zod";

interface AccountAddProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUserAdded: () => void;
}

type FormErrors = Partial<Record<keyof UserRequest, string>>;

export function AccountAdd({ open, onOpenChange, onUserAdded }: AccountAddProps) {
    const [formData, setFormData] = useState<UserRequest>({
        username: "",
        password: "",
        mail: ""
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name: keyof UserRequest, value: string): string | undefined => {
        try {
            const fieldSchema = userRequest.shape[name];
            fieldSchema.parse(value);
            return undefined;
        } catch (error) {
            if (error instanceof ZodError) return error.issues[0]?.message;
            return undefined;
        }
    };

    const validateForm = (): boolean => {
        try {
            userRequest.parse(formData);
            setErrors({});
            return true;
        } catch (error) {
            if (error instanceof ZodError) {
                const newErrors: FormErrors = {};
                error.issues.forEach((issue) => {
                    const field = issue.path[0] as keyof UserRequest;
                    if (!newErrors[field]) newErrors[field] = issue.message;
                });
                setErrors(newErrors);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);

        try {
            await userService.create(formData);
            onUserAdded();
            onOpenChange(false);
            setFormData({ username: "", password: "", mail: "" });
            setErrors({});
        } catch (error) {
            console.error("Tạo user thất bại:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const fieldError = validateField(name as keyof UserRequest, value);
        setErrors(prev => ({ ...prev, [name]: fieldError }));
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            setFormData({ username: "", password: "", mail: "" });
            setErrors({});
        }
        onOpenChange(open);
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Tạo tài khoản</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-6 items-start gap-4">
                            <Label htmlFor="username" className="text-right text-secondary col-span-2 pt-2">
                                TÊN ĐĂNG NHẬP
                            </Label>
                            <div className="col-span-4 space-y-1">
                                <Input id="username" name="username" value={formData.username}
                                    onChange={handleChange} className={errors.username ? "border-red-500" : ""} required />

                                {errors.username && (<p className="text-red-500 text-sm">{errors.username}</p>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-6 items-start gap-4">
                            <Label htmlFor="mail" className="text-right text-secondary col-span-2 pt-2">
                                EMAIL
                            </Label>
                            <div className="col-span-4 space-y-1">
                                <Input id="mail" name="mail" type="email" value={formData.mail}
                                    onChange={handleChange} className={errors.mail ? "border-red-500" : ""} required />

                                {errors.mail && (<p className="text-red-500 text-sm">{errors.mail}</p>)}
                            </div>
                        </div>

                        <div className="grid grid-cols-6 items-start gap-4">
                            <Label htmlFor="password" className="text-right text-secondary col-span-2 pt-2">
                                MẬT KHẨU
                            </Label>
                            <div className="col-span-4 space-y-1">
                                <Input id="password" name="password" type="password" value={formData.password}
                                    onChange={handleChange} className={errors.password ? "border-red-500" : ""} required />

                                {errors.password && (<p className="text-red-500 text-sm">{errors.password}</p>)}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="flogin_delete" onClick={() => handleDialogChange(false)}
                            className="text-secondary">Cancel</Button>

                        <Button type="submit" className="bg-primary text-background" disabled={isLoading}>
                            {isLoading ? "Đang tạo..." : "Tạo tài khoản"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}