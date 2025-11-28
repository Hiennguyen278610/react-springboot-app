import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CategoryDisplayNames, type ProductResponse } from "@/schema/product.schema";

interface ProductViewProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: ProductResponse | null;
}

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

export function ProductView({ open, onOpenChange, product }: ProductViewProps) {
    if (!product) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">Chi tiết sản phẩm</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label className="text-right text-secondary col-span-2">ID</Label>
                        <p className="col-span-4 text-primary font-medium">{product.id}</p>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label className="text-right text-secondary col-span-2">TÊN SẢN PHẨM</Label>
                        <p className="col-span-4 text-primary font-medium">{product.name}</p>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label className="text-right text-secondary col-span-2">GIÁ</Label>
                        <p className="col-span-4 text-primary font-medium">{formatPrice(product.price)}</p>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label className="text-right text-secondary col-span-2">SỐ LƯỢNG</Label>
                        <p className="col-span-4 text-primary font-medium">{product.quantity}</p>
                    </div>

                    <div className="grid grid-cols-6 items-center gap-4">
                        <Label className="text-right text-secondary col-span-2">DANH MỤC</Label>
                        <p className="col-span-4">
                            <span className="bg-secondary/10 text-secondary px-3 py-1 rounded-2xl text-sm">
                                {CategoryDisplayNames[product.category] || product.category}
                            </span>
                        </p>
                    </div>

                    <div className="grid grid-cols-6 items-start gap-4">
                        <Label className="text-right text-secondary col-span-2">MÔ TẢ</Label>
                        <p className="col-span-4 text-primary font-medium">
                            {product.description || "Không có mô tả"}
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="flogin_delete"
                        onClick={() => onOpenChange(false)}
                        className="text-secondary"
                    >
                        Đóng
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
