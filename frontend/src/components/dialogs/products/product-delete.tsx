import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProductResponse } from "@/schema/product.schema";
import { productService } from "@/services/product.service";
import { AlertTriangle } from "lucide-react";

interface ProductDeleteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductResponse | null;
    onProductDeleted: () => void;
}

export function ProductDelete({ open, onOpenChange, product, onProductDeleted }: ProductDeleteProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        if (!product) return;

        setIsLoading(true);
        setError(null);
        try {
            await productService.delete(product.id);
            onProductDeleted();
            onOpenChange(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Xóa sản phẩm thất bại");
        } finally {
            setIsLoading(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <DialogTitle className="text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        Xác nhận xóa
                    </DialogTitle>
                    <DialogDescription className="text-secondary">
                        Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-2">
                    <p className="text-primary">
                        Bạn có chắc chắn muốn xóa sản phẩm <span className="font-bold">"{product.name}"</span> không?
                    </p>
                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="flogin_delete"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                        className="text-secondary"
                    >
                        Hủy
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Đang xóa..." : "Xóa sản phẩm"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
