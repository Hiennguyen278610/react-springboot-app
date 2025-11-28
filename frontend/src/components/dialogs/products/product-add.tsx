import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productRequest, Category, CategoryDisplayNames, type ProductRequest } from "@/schema/product.schema";
import { productService } from "@/services/product.service";
import { Loader2 } from "lucide-react";

interface ProductAddProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onProductAdded: () => void;
}

export function ProductAdd({ open, onOpenChange, onProductAdded }: ProductAddProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<ProductRequest>({
        resolver: zodResolver(productRequest),
        defaultValues: {
            name: "",
            price: 0,
            quantity: 0,
            description: "",
            category: "KHAC",
        },
    });

    const onSubmit = async (data: ProductRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            await productService.create(data);
            onProductAdded();
            reset();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Tạo sản phẩm thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        reset();
        setError(null);
        onOpenChange(false);
    };

    const categoryOptions = Object.entries(Category).map(([, value]) => ({
        value,
        label: CategoryDisplayNames[value as keyof typeof CategoryDisplayNames],
    }));

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Thêm sản phẩm mới</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label htmlFor="name" className="text-right text-secondary col-span-2">
                            Tên sản phẩm
                        </Label>
                        <div className="col-span-4">
                            <Input
                                id="name"
                                {...register("name")}
                                disabled={isLoading}
                                placeholder="Nhập tên sản phẩm"
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label htmlFor="price" className="text-right text-secondary col-span-2">
                            Giá (VNĐ)
                        </Label>
                        <div className="col-span-4">
                            <Input
                                id="price"
                                type="number"
                                {...register("price", { valueAsNumber: true })}
                                disabled={isLoading}
                                placeholder="Nhập giá sản phẩm"
                            />
                            {errors.price && (
                                <p className="text-sm text-red-500 mt-1">{errors.price.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label htmlFor="quantity" className="text-right text-secondary col-span-2">
                            Số lượng
                        </Label>
                        <div className="col-span-4">
                            <Input
                                id="quantity"
                                type="number"
                                {...register("quantity", { valueAsNumber: true })}
                                disabled={isLoading}
                                placeholder="Nhập số lượng"
                            />
                            {errors.quantity && (
                                <p className="text-sm text-red-500 mt-1">{errors.quantity.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label htmlFor="category" className="text-right text-secondary col-span-2">
                            Danh mục
                        </Label>
                        <div className="col-span-4">
                            <select
                                id="category"
                                {...register("category")}
                                disabled={isLoading}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {categoryOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.category && (
                                <p className="text-sm text-red-500 mt-1">{errors.category.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-6 items-start gap-4">
                        <Label htmlFor="description" className="text-right text-secondary col-span-2 pt-2">
                            Mô tả
                        </Label>
                        <div className="col-span-4">
                            <textarea
                                id="description"
                                {...register("description")}
                                disabled={isLoading}
                                placeholder="Nhập mô tả sản phẩm (tối đa 500 ký tự)"
                                rows={3}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                            {errors.description && (
                                <p className="text-sm text-red-500 mt-1">{errors.description.message}</p>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-red-500 text-center">{error}</p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="flogin_delete"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="text-secondary"
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Đang tạo...
                                </>
                            ) : (
                                "Tạo sản phẩm"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
